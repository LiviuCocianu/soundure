import React, { useState } from 'react'
import { ImageBackground, Dimensions } from 'react-native'
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
    ScrollView 
} from 'native-base'

import * as ImagePicker from 'expo-image-picker'
import { useDispatch } from 'react-redux'

import NoCoverImage from '../general/NoCoverImage'
import { IMAGE_QUALITY, RESERVED_PLAYLISTS } from '../../constants'
import { PlaylistUtils } from '../../database/componentUtils'


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
    const [coverStringURI, setCoverStringURI] = useState(null);
    const [coverObjectURI, setCoverObjectURI] = useState(initialCoverObjectURI);
 
    const [errors, setErrors] = useState({});
    const dispatch = useDispatch();

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

        if(title.length < 3) {
            err = { ...err,
                title: "Denumire mai mică de 3 caractere"
            };
        } else if(title.length > 64) {
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
            PlaylistUtils.addPlaylist({title, description, coverURI: coverStringURI}, dispatch);
            handleClose();
        }
    }

    const handleClose = () => {
        setTitle("");
        setDescription("");
        setCoverStringURI(null);
        setCoverObjectURI(initialCoverObjectURI);
        setErrors({})

        closeHandle(false);
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <Modal.Content 
                w="90%" h={`${parseInt(Dimensions.get("screen").height)}`} 
                bg="primary.800" 
                borderColor="primary.600" 
                borderWidth="2"
            >
                <Modal.CloseButton _icon={{ color: "white" }}/>
                <Box w="100%" h="100%">
                    {
                        coverStringURI === null ? (
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

                                <TextArea 
                                    h="100"
                                    borderColor="primary.50"
                                    color="primary.50"
                                    fontFamily="manrope_r"
                                    onChangeText={setDescription}
                                    _focus={{
                                        borderColor: "primary.50"
                                    }}
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
