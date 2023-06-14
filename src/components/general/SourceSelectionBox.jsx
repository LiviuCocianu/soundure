import React, { memo } from 'react'
import { Box, Text, FormControl, Radio, Icon, Button, HStack, VStack } from 'native-base'

import * as Linking from 'expo-linking'

import CustomIcon from "../../icons"
import { PLATFORMS } from '../../constants'
import { firstConnected } from '../../functions'
import Toast from 'react-native-root-toast'


const SOURCE_TOOLS = {
    SPOTIFY: {
        track: ["https://spotifydown.com/", "https://spotify-downloader.com/"],
        cover: []
    },
    SOUNDCLOUD: {
        track: ["https://www.klickaud.co/", "https://downcloud.cc/"],
        cover: ["https://www.howtotechies.com/soundcloud-artwork-downloader"]
    },
    YOUTUBE: {
        track: ["https://en.y2mate.is/231/youtube-to-mp3.html", "https://x2download.app/en66/download-youtube-to-mp3"],
        cover: ["https://youtube-thumbnail-grabber.com/", "https://thumbnailphoto.net/"]
    }
}

const propsAreEqual = (prev, next) => (
    prev.platform == next.platform
    && prev.setPlatform == next.setPlatform
    && prev.handleFileChoice == next.handleFileChoice
);

/**
 * @callback handleFileChoice
 */

/**
 * SourceSelectionBox component
 * 
 * @param {object} props props object
 * @param {string} props.platform Passed platform state
 * @param {React.Dispatch} props.setPlatform Passed setter for platform
 * @param {handleFileChoice} props.handleFileChoice Function that passes the chosen platform upwards
 * 
 * @returns {JSX.Element} JSX component
 */
const SourceSelectionBox = ({ platform, setPlatform, handleFileChoice }) => {
    const handleTrackTool = () => {
        firstConnected(SOURCE_TOOLS[platform].track).then(url => {
            if(url) Linking.openURL(url);
        });
    }

    const handleCoverTool = () => {
        if (SOURCE_TOOLS[platform].cover.length == 0) {
            Toast.show("Această platformă nu suportă descărcarea de coperți");
            return;
        }

        firstConnected(SOURCE_TOOLS[platform].cover).then(url => {
            if (url) Linking.openURL(url);
        });
    }

    return (
        <Box mt="12" p="4" pb="6"
            bg="primary.900"
            rounded="lg"
            alignItems="center"
        >
            <VStack w="90%" space="5">
                <FormControl isRequired w="auto">
                    <Text mb="4"
                        color="white"
                        fontFamily="quicksand_b">Alege platforma</Text>

                    <Radio.Group value={platform} onChange={setPlatform}>
                        <SourceRadio id="spotify" name="Spotify" color="green.400" value={PLATFORMS.SPOTIFY} />
                        <Box mb="1.5" />
                        <SourceRadio id="soundcloud" name="Soundcloud" color="orange.400" value={PLATFORMS.SOUNDCLOUD} />
                        <Box mb="1.5" />
                        <SourceRadio id="youtube" name="Youtube" color="red.400" value={PLATFORMS.YOUTUBE} />
                    </Radio.Group>
                </FormControl>

                <Text color="white"
                    fontFamily="quicksand_b">Alege un instrument</Text>

                <HStack w="100%" flex="1">
                    <Button flex="0.5"
                        onPress={handleTrackTool}
                        _text={{
                            fontFamily: "quicksand_b",
                            fontSize: "xs",
                            lineHeight: 14,
                            textAlign: "center",
                        }}>Descarcă piesă</Button>

                    <Button flex="0.5" ml="4"
                        onPress={handleCoverTool}
                        _text={{
                            fontFamily: "quicksand_b",
                            fontSize: "xs",
                            lineHeight: 14,
                            textAlign: "center",
                        }}>Descarcă copertă</Button>
                </HStack>

                <FormControl isRequired alignItems="center">
                    <Text w="100%" mb="4"
                        onPress={() => handleFileChoice(platform)}
                        color="white"
                        underline
                        fontFamily="quicksand_b">Încarcă piesa obținută aici</Text>
                </FormControl>
            </VStack>
        </Box>
    )
}

const SourceRadio = ({ id, name, color, value }) => (
    <Radio borderWidth="0"
        bg="primary.700"
        size="lg"
        value={value}
        icon={<Icon as={<CustomIcon name={`${id}_logo`} size={10} color="white" />} />}
        _checked={{
            bg: color,
            _icon: { color: "white" }
        }}
        _text={{
            fontFamily: "manrope_b",
            fontSize: "xs",
            color: "white",
        }}>{name}</Radio>
);


export default memo(SourceSelectionBox, propsAreEqual);