import React, { useState, useEffect, useRef } from 'react'
import { ImageBackground, Animated } from 'react-native'
import { Box, Pressable, Switch, Text } from 'native-base'
import { QuoteBridge } from '../../../database/componentBridge';
import Toast from 'react-native-root-toast';
import { DEFAULT_QUOTE } from '../../../constants';


const bannerDarkURI = require("../../../../assets/images/soundure_banner_dark.png");
const QUOTE_MAX_LEN = 130;

/**
 * QuoteBox component
 * 
 * @returns {JSX.Element} JSX component
 */
const QuoteBox = () => {
    const progress = useRef(new Animated.Value(0)).current;

    const [quote, setQuote] = useState(DEFAULT_QUOTE.CONTENT);
    const [author, setAuthor] = useState(DEFAULT_QUOTE.AUTHOR);
    const [updatesDaily, toggleDailyUpdate] = useState(false);

    useEffect(() => {
        QuoteBridge.updatesDaily().then(updates => {
            toggleDailyUpdate(!!updates);
        });
    }, []);

    useEffect(() => {
        if(updatesDaily) getQuote();
    }, [updatesDaily]);

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
    }, [quote]);
    
    const getQuote = () => {
        QuoteBridge.fetchQuote().then(res => {
            setQuote(res.quote);
            setAuthor(res.author);
        });
    }

    const handleQuoteToast = () => {
        if(quote.length > QUOTE_MAX_LEN) {
            Toast.show(quote, { duration: Toast.durations.LONG });
        }
    }

    const handleQuoteUpdates = () => {
        QuoteBridge.toggleDailyUpdate().then(() => toggleDailyUpdate(!updatesDaily));
    }

    return (
        <Box w="100%" h={updatesDaily ? "170" : "12"} position="relative">
            <Switch
                onChange={handleQuoteUpdates}
                isChecked={updatesDaily}
                zIndex={10}
                position="absolute"
                top={0} right="2"
                offTrackColor="primary.500"
                offThumbColor="white"
                onTrackColor="primary.50" />
            
            <Pressable onPress={handleQuoteToast}>
                <ImageBackground h="100%"
                    source={bannerDarkURI}
                    alt="quote cover"
                    resizeMode="cover"
                >
                    <Box w="100%" h="100%"
                        bg="black"
                        position="absolute"
                        opacity="50" />

                    <Animated.View style={{ opacity: progress }}>
                        <Box w="100%" h="100%" px="10"
                            justifyContent="center"
                            alignItems="center"
                            display={updatesDaily ? undefined : "none"}
                        >
                            <Text color="white"
                                fontFamily="quicksand_b"
                                fontSize="xl">Citatul zilei!</Text>

                            <Text my="1"
                                color="white"
                                fontFamily="manrope_li"
                                fontSize="xs"
                            >
                                "{
                                    quote.length > QUOTE_MAX_LEN
                                        ? `${quote.slice(0, QUOTE_MAX_LEN - 1)}...`
                                        : `${quote}"`
                                }</Text>

                            <Text color="white"
                                alignSelf="flex-end"
                                fontFamily="manrope_b"
                                fontSize="xs"
                            >- {author}</Text>
                        </Box>
                    </Animated.View>
                </ImageBackground>
            </Pressable>
        </Box>
    )
}

export default QuoteBox