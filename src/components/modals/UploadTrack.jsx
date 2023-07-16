import React, { useState, Component, useMemo, useEffect } from 'react'
import { ImageBackground, Dimensions, Keyboard } from 'react-native'
import {
    Box,
    Modal,
    Factory,
    AspectRatio,
    ScrollView,
    Text,
    FormControl,
    Input,
    Button,
    Pressable,
} from 'native-base'

import { useDispatch } from 'react-redux'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { Entypo, AntDesign } from '@expo/vector-icons'
import { Audio } from 'expo-av'

import SourceSelectionBox from '../general/SourceSelectionBox'
import NoCoverImage from '../general/NoCoverImage'
import CustomActionsheet, { CustomActionsheetItem } from '../general/CustomActionsheet'

import { TrackBridge } from '../../database/componentBridge'
import { createTrack } from '../../database/shapes'
import { handleCoverURI } from '../../functions'
import { ARTIST_NAME_PLACEHOLDER, IMAGE_QUALITY, PLATFORMS } from '../../constants'


const EntypoNB = Factory(Entypo);
const AntDesignNB = Factory(AntDesign);
const ImageNB = Factory(ImageBackground);

const defaultCoverURI = require("../../../assets/images/soundure_banner_dark.png");
const screenHeight = parseInt(Dimensions.get("screen").height);

/**
 * Modal visibility handler
 * @callback closeHandle
 * @param {boolean} visible Modal visibility
 */

/**
 * UploadTrack component
 * 
 * @param {object} props props object
 * @param {boolean} props.isOpen Indicates the visibility of the modal
 * @param {closeHandle} props.closeHandle Modal visibility handler
 * 
 * @returns {Component} Component JSX
 */
const UploadTrack = ({ isOpen, closeHandle }) => {
    const dispatch = useDispatch();

    const [title, setTitle] = useState("");
    const [artist, setArtist] = useState(ARTIST_NAME_PLACEHOLDER);
    const [coverURI, setCoverURI] = useState("DEFAULT");
    const [fileURI, setFileURI] = useState(undefined);
    const [millis, setMillis] = useState(0);
    const [platform, setPlatform] = useState(PLATFORMS.SPOTIFY);

    const [sourceHelper, setSourceHelper] = useState("");
    const [sourceSelectionBox, toggleSourceSelectionBox] = useState(false);
    const [sourceOptions, toggleSourceOptions] = useState(false);
    const [errors, setErrors] = useState({});

    const cover = useMemo(() => handleCoverURI(coverURI, defaultCoverURI), [coverURI]);

    const [keyboardVisible, toggleKeyboardVisible] = useState(false);
    const [modalBottomOffset, setModalBottomOffset] = useState("0");
    const [titleFocused, toggleTitleFocus] = useState(false);
    const [artistFocused, toggleArtistFocus] = useState(false);

    useEffect(() => {
        const keyboardShow = Keyboard.addListener("keyboardDidShow", () => toggleKeyboardVisible(true));
        const keyboardHide = Keyboard.addListener("keyboardDidHide", () => toggleKeyboardVisible(false));

        return () => {
            keyboardShow.remove();
            keyboardHide.remove();
        }
    }, []);

    useEffect(() => {
        if(!keyboardVisible) {
            setModalBottomOffset("0");
            toggleTitleFocus(false);
            toggleArtistFocus(false);
        }
    }, [keyboardVisible]);

    useEffect(() => {
        if(titleFocused) setModalBottomOffset("150");
        else if (artistFocused) setModalBottomOffset("240");
    }, [titleFocused, artistFocused]);

    const handleCoverChoice = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: IMAGE_QUALITY
        });

        if (!result.canceled) {
            setCoverURI({ uri: result.assets[0].uri });
        }
    }

    const handleFileChoice = async (platform) => {
        toggleSourceSelectionBox(false);

        if (platform == PLATFORMS.NONE) {
            toggleSourceOptions(false);
        }

        const result = await DocumentPicker.getDocumentAsync({ 
            type: "audio/*"
        });

        if (result.type == "success") {
            setFileURI(result.uri);
            setSourceHelper(result.name);
            setPlatform(platform);

            const millis = await getMillis(result.uri);
            setMillis(millis);

            if(title === "") {
                const fileName = result.name.split(".");
                setTitle(fileName.slice(0, fileName.length - 1).join("."));
            }
        }
    }

    const getMillis = async (uri) => {
        const sound = new Audio.Sound();

        try {
            await sound.loadAsync({ uri });
            const data = await sound.getStatusAsync();

            return data.durationMillis;
        } catch (error) {
            console.error(`Could not load track for '${uri}':`, error);
        }

        return 0;
    }

    const handleSourceSelectionBox = () => {
        setFileURI(undefined);
        setSourceHelper("");
        setPlatform(PLATFORMS.SPOTIFY);
        setTitle("");
        setArtist(ARTIST_NAME_PLACEHOLDER);

        toggleSourceSelectionBox(true);
        toggleSourceOptions(false);
    }

    const handleSubmit = () => {
        let err = { ...errors };

        if (title.length < 3) {
            err = {
                ...err,
                title: "Denumire mai mică de 3 caractere"
            };
        } else if (title.length > 128) {
            err = {
                ...err,
                title: "Denumire prea lungă"
            };
        } else delete err.title;

        if (artist.length < 3) {
            err = {
                ...err,
                artist: "Denumire mai mică de 3 caractere"
            };
        } else if (artist.length > 64) {
            err = {
                ...err,
                artist: "Denumire prea lungă"
            };
        } else delete err.artist;

        if (!fileURI) {
            err = {
                ...err,
                fileURI: "Încărcați un fișier audio!"
            };
        } else {
            TrackBridge.trackExists(fileURI)
                .then(() => {
                    err = {
                        ...err,
                        fileURI: "O piesă la acestă locație este deja încărcată!"
                    };
                })
                .catch(() => {
                    delete err.fileURI;
                });
        }

        setErrors(err);

        // All validation have passed
        if (Object.keys(err).length == 0) {
            let track = createTrack(title, fileURI, "DEFAULT", platform, millis);
            if (coverURI && coverURI != "DEFAULT") 
                track.coverURI = coverURI == "DEFAULT" ? coverURI : JSON.stringify(coverURI);

            const newArtist = artist == "" ? ARTIST_NAME_PLACEHOLDER : artist;

            TrackBridge.addTrack({ artist: newArtist, track}, dispatch);
            handleClose();
        }
    }

    const handleClose = () => {
        setTitle("");
        setArtist(ARTIST_NAME_PLACEHOLDER);
        setCoverURI(undefined);
        setFileURI(undefined);
        setMillis(0);
        setPlatform(PLATFORMS.SPOTIFY);

        setSourceHelper("");
        setErrors({});
        toggleSourceSelectionBox(false);
        setModalBottomOffset("0");

        closeHandle(false);
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <CustomActionsheet
                title="Sursă piesă"
                isOpen={sourceOptions}
                onClose={() => toggleSourceOptions(false)}
            >
                <CustomActionsheetItem text="Preia din dispozitiv"
                    iconName="mobile"
                    IconType={EntypoNB}
                    onPress={() => handleFileChoice(PLATFORMS.NONE)} />

                <CustomActionsheetItem text="Preia din exterior"
                    iconName="link"
                    IconType={AntDesignNB}
                    onPress={handleSourceSelectionBox} />
            </CustomActionsheet>

            <Modal.Content w="90%" h={screenHeight}
                bg="primary.800"
                borderColor="primary.600"
                borderWidth="2"
                mb={modalBottomOffset}
            >
                <Modal.CloseButton _icon={{ color: "white" }} />

                <Box w="100%" h="100%">
                    <ImageNB w="100%" h="40%"
                        bg="primary.400"
                        imageStyle={{ height: "150%" }}
                        resizeMode="cover"
                        source={cover}
                        overflow="hidden"
                        blurRadius={10}
                    >
                        <AspectRatio ratio="4/4" h="100%" alignSelf="center">
                            {
                                (!coverURI || coverURI == "DEFAULT") ? (
                                    <NoCoverImage />
                                ) : (
                                    <ImageNB
                                        source={cover}
                                        resizeMode="cover"
                                        imageStyle={{ height: "100%" }}
                                    ></ImageNB>
                                )
                            }
                        </AspectRatio>
                    </ImageNB>

                    <ScrollView w="100%" h="60%" px="5" pt="5"
                        _contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
                    >
                        <Text pb="2" mb="4"
                            color="white"
                            fontFamily="quicksand_b"
                            fontSize="md"
                            borderBottomColor="primary.600"
                            borderBottomWidth="1">Încarcă o piesă</Text>

                        <FormControl mt="3" mb="1" isRequired isInvalid={"fileURI" in errors}>
                            <Box
                                justifyContent="space-between"
                                alignItems="center"
                                flexDir="row"
                            >
                                <FormControl.Label _text={{
                                    fontFamily: "manrope_r",
                                    fontSize: "xs",
                                    color: "gray.400"
                                }}>Sursă piesă</FormControl.Label>

                                <Button h="30" p="0" px="6"
                                    onPress={() => toggleSourceOptions(true)}
                                    _text={{
                                        fontFamily: "manrope_r",
                                        fontSize: "xs"
                                    }}>Alege</Button>
                            </Box>
                            <FormControl.ErrorMessage mt="0">
                                {'fileURI' in errors ? errors.fileURI : ""}
                            </FormControl.ErrorMessage>
                            {
                                sourceHelper != "" ? (
                                    <FormControl.HelperText mb="4">{sourceHelper}</FormControl.HelperText>
                                ) : <></>
                            }
                        </FormControl>

                        <FormControl
                            justifyContent="space-between"
                            alignItems="center"
                            flexDir="row"
                        >
                            <FormControl.Label _text={{
                                fontFamily: "manrope_r",
                                fontSize: "xs",
                                color: "gray.400"
                            }}>Poză de copertă</FormControl.Label>

                            <Button h="30" p="0" px="6"
                                onPress={handleCoverChoice}
                                _text={{
                                    fontFamily: "manrope_r",
                                    fontSize: "xs"
                                }}>Alege</Button>
                        </FormControl>

                        <FormControl h="35" isRequired isInvalid={"title" in errors}>
                            <Input mt="2" value={title}
                                onChangeText={setTitle}
                                color="primary.50"
                                placeholder="Titlu piesă"
                                borderBottomColor="primary.50"
                                placeholderTextColor="gray.400"
                                fontFamily="manrope_r"
                                variant="underlined"
                                onPressOut={() => toggleTitleFocus(true)} />

                            <FormControl.ErrorMessage mt="0">
                                {'title' in errors ? errors.title : ""}
                            </FormControl.ErrorMessage>
                        </FormControl>

                        <FormControl h="35" mt="6" isInvalid={"artist" in errors}>
                            <Input value={artist}
                                onChangeText={setArtist}
                                color="primary.50"
                                placeholder="Nume artist"
                                borderBottomColor="primary.50"
                                placeholderTextColor="gray.400"
                                fontFamily="manrope_r"
                                variant="underlined"
                                onPressOut={() => toggleArtistFocus(true)} />

                            <FormControl.ErrorMessage mt="0">
                                {'artist' in errors ? errors.artist : ""}
                            </FormControl.ErrorMessage>
                        </FormControl>

                        {
                            sourceSelectionBox ? (
                                <SourceSelectionBox
                                    platform={platform}
                                    setPlatform={setPlatform}
                                    handleFileChoice={handleFileChoice}
                                />
                            ) : <></>
                        }

                        <Button mt="12" onPress={handleSubmit}
                            _text={{ fontFamily: "quicksand_b" }}>Încarcă</Button>
                    </ScrollView>
                </Box>
            </Modal.Content>
        </Modal>
    )
}


export default UploadTrack