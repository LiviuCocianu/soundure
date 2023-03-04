import React, { useState } from 'react';
import { Box, FormControl, Modal, VStack, Text, Input, TextArea, Button, Factory } from 'native-base';
import { ImageBackground, Dimensions } from 'react-native'
import NoCoverImage from '../NoCoverImage';
import * as ImagePicker from 'expo-image-picker'

const CreatePlaylist = ({
    isOpen,
    closeHandle
}) => {
    const [title, setTitle] = useState("playlist_title");
    const [description, setDescription] = useState("playlist_description");
    const [coverURI, setCoverURI] = useState("");

    const [errors, setErrors] = useState({});

    const ImageNB = Factory(ImageBackground);

    const handleCoverChoice = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        if(!result.canceled) {
            setCoverURI(result.assets[0].uri);
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
        } else err = {};

        setErrors(err);

        // All validation have passed
        if (Object.keys(err).length == 0) {
            
        }
    }

    const handleClose = () => {
        setTitle("");
        setDescription("");
        setCoverURI("");
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
                <Box w="100%" h="100%" flex="1">
                    {
                        coverURI === "" ? (
                            <NoCoverImage flex="0.35"/>
                        ) : (
                            <ImageNB
                                w="100%"
                                flex="0.35"
                                imageStyle={{height: "100%"}}
                                source={{uri: coverURI}}
                                resizeMode="cover"
                            ></ImageNB>
                        )
                    }
                    
                    <Box
                        w="100%"
                        flex="0.75"
                        justifyContent="center"
                        alignItems="center"
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

                            <FormControl>
                                <FormControl.Label _text={{
                                    fontFamily: "manrope_r",
                                    fontSize: "xs",
                                    color: "gray.400"
                                }}>Descriere</FormControl.Label>

                                <TextArea 
                                    h="50"
                                    borderColor="primary.50"
                                    color="primary.50"
                                    fontFamily="manrope_r"
                                    onChangeText={setDescription}
                                    _focus={{
                                        borderColor: "primary.50"
                                    }}
                                />
                            </FormControl>

                            <FormControl
                                flex="0.4"
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
                    </Box>
                </Box>
            </Modal.Content>
        </Modal>
    );
};

export default CreatePlaylist;
