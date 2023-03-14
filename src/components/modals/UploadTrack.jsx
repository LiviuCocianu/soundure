import React, { useState, Component } from 'react'
import { ImageBackground, Dimensions } from 'react-native'
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
  Actionsheet,
} from 'native-base'

import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'

import SourceSelectionBox from './SourceSelectionBox'
import NoCoverImage from '../general/NoCoverImage'
import { database as db } from "../../database/index"

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
  const defaultCoverURI = require("../../assets/images/soundure_banner_dark.png");
  const ImageNB = Factory(ImageBackground);
  const screenHeight = parseInt(Dimensions.get("screen").height);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("Necunoscut");
  const [coverURI, setCoverURI] = useState(defaultCoverURI);
  const [fileURI, setFileURI] = useState(null);
  const [url, setURL] = useState("");
  const [platform, setPlatform] = useState("SPOTIFY");

  const [sourceHelper, setSourceHelper] = useState("");
  const [sourceSelectionBox, toggleSourceSelectionBox] = useState(false);
  const [sheetIsOpen, toggleSheet] = useState(false);
  const [errors, setErrors] = useState({});

  const handleCoverChoice = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setCoverURI({ uri: result.assets[0].uri });
    }
  }

  const handleFileChoice = async () => {
    let result = await DocumentPicker.getDocumentAsync({ type: "audio/*" });

    toggleSheet(false);

    if (result.type == "success") {
      setFileURI({ uri: result.uri });
      setSourceHelper(result.name);

      if(title === "") {
        setTitle(result.name.split(".")[0]);
      }
    }
  }

  const handleFileURLChoice = () => {
    toggleSourceSelectionBox(true);
    toggleSheet(false);
  }

  const handleSourceChoice = () => {
    toggleSheet(true);
  }

  const handleSubmit = () => {
    let err = { ...errors };

    if (title.length < 3) {
      err = {
        ...err,
        title: "Denumire mai mică de 3 caractere"
      };
    } else if (title.length > 64) {
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

    setErrors(err);

    // All validation have passed
    if (Object.keys(err).length == 0) {
      db.insertIfNotExists("Artist", { name: artist }, "name = ?", [artist]).then(() => {
        db.selectFrom("Artist", null, "name = ?", [artist]).then(rows => {
          const artistId = rows[0].id;
          const toInsert = { title, coverURI, platform, artistId };

          db.insertInto("Track", toInsert).then(rs => {
            const payload = { id: rs.insertId, ...toInsert };
            dispatch(trackAdded(payload));
          });
        });
      });

      handleClose();
    }
  }
  
  const handleClose = () => {
    setTitle("");
    setArtist("");
    setCoverURI(defaultCoverURI);
    setFileURI(null);
    setURL("");
    setPlatform("SPOTIFY");
    setSourceHelper("");
    setErrors({})

    closeHandle(false);
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Actionsheet isOpen={sheetIsOpen} onClose={() => toggleSheet(false)}>
        <Actionsheet.Content pb="4"
          bg="primary.700"
          _dragIndicatorWrapper={{ bg:"primary.700" }}
          _dragIndicator={{ bg: "primary.50" }}
        >
          <Text mb="2"
            color="white" 
            fontFamily="quicksand_b" 
            fontSize="md">Sursă piesă</Text>

          <SourceActionsheetItem text="Preia din dispozitiv" onPress={handleFileChoice}/>
          <SourceActionsheetItem text="Preia din URL" onPress={handleFileURLChoice}/>
        </Actionsheet.Content>
      </Actionsheet>

      <Modal.Content w="90%" h={screenHeight} 
          bg="primary.800" 
          borderColor="primary.600" 
          borderWidth="2"
      >
        <Modal.CloseButton _icon={{ color: "white" }}/>

        <Box w="100%" h="100%">
          <ImageNB w="100%" h="40%"
            bg="primary.400"
            imageStyle={{height: "150%"}}
            resizeMode="cover"
            source={coverURI}
            overflow="hidden"
            blurRadius={10}
          >
            <AspectRatio ratio="4/4" h="100%" alignSelf="center">
              {
                coverURI === defaultCoverURI ? (
                  <NoCoverImage/>
                ) : (
                  <ImageNB
                      source={coverURI}
                      resizeMode="cover"
                      imageStyle={{height: "100%"}}
                  ></ImageNB>
                )
              }
            </AspectRatio>
          </ImageNB>

          <ScrollView w="100%" h="60%" px="5" pt="5"
            _contentContainerStyle={{ flexGrow: 1, paddingBottom: 10}} 
          >
            <Text pb="2" mb="4"
              color="white"
              fontFamily="quicksand_b"
              fontSize="md"
              borderBottomColor="primary.600"
              borderBottomWidth="1">Încarcă o piesă</Text>

            <FormControl h="35" isRequired isInvalid={"title" in errors}>
              <Input value={title}
                onChangeText={setTitle}
                color="primary.50"
                placeholder="Titlu piesă"
                borderBottomColor="primary.50"
                placeholderTextColor="gray.400"
                fontFamily="manrope_r"
                variant="underlined"/>

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
                variant="underlined"/>

              <FormControl.ErrorMessage mt="0">
                {'artist' in errors ? errors.artist : ""}
              </FormControl.ErrorMessage>
            </FormControl>

            <FormControl mt="6"
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

            <FormControl mt="6" isRequired>
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
                  onPress={handleSourceChoice}
                  _text={{
                    fontFamily: "manrope_r",
                    fontSize: "xs"
                  }}>Alege</Button>
              </Box>
              <FormControl.HelperText>{sourceHelper}</FormControl.HelperText>
            </FormControl>

            {
              sourceSelectionBox ? (
                <SourceSelectionBox 
                  url={url}
                  setURL={setURL}
                  platform={platform}
                  setPlatform={setPlatform}
                />
              ) : null
            }

            <Button mt="6" onPress={handleSubmit} 
              _text={{ fontFamily: "quicksand_b" }}>Încarcă</Button>
          </ScrollView>
        </Box>
      </Modal.Content>
    </Modal>
  )
}

const SourceActionsheetItem = ({ text, onPress }) => (
  <Actionsheet.Item
    bg="primary.700"
    onPress={onPress}
    borderBottomWidth="1"
    borderBottomColor="primary.200"
    _text={{ color: "white", fontFamily: "manrope_r", fontSize: "xs" }}
  >{text}</Actionsheet.Item>
);

export default UploadTrack