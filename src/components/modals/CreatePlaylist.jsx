import React, { useState, useEffect } from 'react'
import { ImageBackground, Dimensions, Keyboard } from 'react-native'
import { 
    Box, 
    FormControl, 
    Modal, 
    VStack, 
    Text, 
    Input, 
    TextArea, 
    Button, 
    Factory, 
    ScrollView, 
    Pressable
} from 'native-base'

import * as ImagePicker from 'expo-image-picker'
import { useDispatch } from 'react-redux'

import NoCoverImage from '../general/NoCoverImage'
import { PlaylistBridge } from '../../database/componentBridge'
import { IMAGE_QUALITY, RESERVED_PLAYLISTS } from '../../constants'
import { createPlaylist } from '../../database/shapes'


const initialCoverObjectURI = require("../../../assets/images/soundure_banner_dark.png");
const ImageNB = Factory(ImageBackground);

/**
 * @callback closeHandle
 * @param {boolean} visible Modal visibility
 */

/**
 * CreatePlaylist component
 * 
 * @param {object} props props object
 * @param {boolean} props.isOpen Indicates the visibility of the modal
 * @param {closeHandle} props.closeHandle Modal visibility handler
 * 
 * @returns {JSX.Element} JSX component
 */
const CreatePlaylist = ({ isOpen, closeHandle }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [coverStringURI, setCoverStringURI] = useState(undefined);
    const [coverObjectURI, setCoverObjectURI] = useState(initialCoverObjectURI);
 
    const [errors, setErrors] = useState({});
    const dispatch = useDispatch();

    const [keyboardVisible, toggleKeyboardVisible] = useState(false);
    const [modalBottomOffset, setModalBottomOffset] = useState("0");
    const [descFocused, toggleDescFocus] = useState(false);

    useEffect(() => {
        const keyboardShow = Keyboard.addListener("keyboardDidShow", () => toggleKeyboardVisible(true));
        const keyboardHide = Keyboard.addListener("keyboardDidHide", () => toggleKeyboardVisible(false));

        return () => {
            keyboardShow.remove();
            keyboardHide.remove();
        }
    }, []);

    useEffect(() => {
        if (!keyboardVisible) {
            setModalBottomOffset("0");
            toggleDescFocus(false);
        }
    }, [keyboardVisible]);

    useEffect(() => {
        if (descFocused) setModalBottomOffset("250");
    }, [descFocused]);

    const handleCoverChoice = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: IMAGE_QUALITY,
        });

        if(!result.canceled) {
            setCoverStringURI(result.assets[0].uri);
            setCoverObjectURI({uri: result.assets[0].uri});
        }
    }

    const handleSubmit = () => {
        let err = {...errors};

        if(title.length > 64) {
            err = { ...err,
                title: "Denumire prea lungă"
            };
        } else if(RESERVED_PLAYLISTS.includes(title)) {
            err = {
                ...err,
                title: "Titlu rezervat! Încearcă alt titlu"
            }
        } else delete err.title;
        
        if(description.length > 500) {
            err = { ...err,
                description: "Descriere prea lungă"
            };
        } else delete err.description;

        setErrors(err);

        // All validation have passed
        if (Object.keys(err).length == 0) {
            let newTitle = title == "" ? "Playlist" : title;

            PlaylistBridge.addPlaylist(createPlaylist(newTitle, description, coverStringURI), dispatch);
            handleClose();
        }
    }

    const handleClose = () => {
        setTitle("");
        setDescription("");
        setCoverStringURI(undefined);
        setCoverObjectURI(initialCoverObjectURI);
        setErrors({});
        setModalBottomOffset("0");

        closeHandle(false);
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <Modal.Content 
                w="90%" h={`${parseInt(Dimensions.get("screen").height)}`} 
                bg="primary.800" 
                borderColor="primary.600" 
                borderWidth="2"
                mb={modalBottomOffset}
            >
                <Modal.CloseButton _icon={{ color: "white" }}/>
                <Box w="100%" h="100%">
                    {
                        !coverStringURI ? (
                            <NoCoverImage h="35%"/>
                        ) : (
                            <ImageNB
                                w="100%"
                                h="35%"
                                imageStyle={{height: "100%"}}
                                source={coverObjectURI}
                                resizeMode="cover"
                            ></ImageNB>
                        )
                    }
                    
                    <ScrollView
                        w="100%"
                        h="70%"
                        _contentContainerStyle={{
                            flexGrow: 1,
                            alignItems: "center"
                        }}
                    >
                        <VStack 
                            w="100%" h="100%" 
                            px="5" pt="5"
                            space="lg"
                        >
                            <Text 
                                pb="2"
                                color="white" 
                                fontFamily="quicksand_b" 
                                fontSize="md"
                                borderBottomColor="primary.600"
                                borderBottomWidth="1"
                            >Creează un playlist nou!</Text>

                            <FormControl h="35" isRequired isInvalid={"title" in errors}>
                                <Input
                                    variant="underlined" 
                                    placeholder="Denumire playlist"
                                    color="primary.50"
                                    borderBottomColor="primary.50"
                                    placeholderTextColor="gray.400"
                                    fontFamily="manrope_r"
                                    onChangeText={setTitle}
                                />
                                <FormControl.ErrorMessage mt="0">{'title' in errors ? errors.title : ""}</FormControl.ErrorMessage>
                            </FormControl>

                            <FormControl isInvalid={"description" in errors}>
                                <FormControl.Label _text={{
                                    fontFamily: "manrope_r",
                                    fontSize: "xs",
                                    color: "gray.400"
                                }}>Descriere</FormControl.Label>

                                <TextArea h="100"
                                    value={description}
                                    onChangeText={setDescription}
                                    borderColor="primary.50"
                                    color="primary.50"
                                    fontFamily="manrope_r"
                                    _focus={{
                                        borderColor: "primary.50"
                                    }}
                                    onTouchEnd={() => toggleDescFocus(true)}
                                />
                                <FormControl.ErrorMessage mt="0">{"description" in errors ? errors.description : ""}</FormControl.ErrorMessage>
                            </FormControl>

                            <FormControl
                                flexDir="row"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <FormControl.Label _text={{
                                    fontFamily: "manrope_r",
                                    fontSize: "xs",
                                    color: "gray.400"
                                }}>Poză de copertă</FormControl.Label>

                                <Button h="30" 
                                    p="0" px="6" 
                                    _text={{
                                        fontFamily: "manrope_r",
                                        fontSize: "xs"
                                    }}
                                    onPress={handleCoverChoice}
                                >Alege</Button>
                            </FormControl>

                            <Button mt="auto" mb="4"
                                onPress={handleSubmit}
                                _text={{
                                    fontFamily: "quicksand_b"
                                }}
                            >
                                Creează
                            </Button>
                        </VStack>
                    </ScrollView>
                </Box>
            </Modal.Content>
        </Modal>
    );
};

export default CreatePlaylist
