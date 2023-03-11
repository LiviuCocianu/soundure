import React, { useState, useEffect, Component } from 'react'
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
import { ImageBackground, Dimensions } from 'react-native'
import NoCoverImage from '../general/NoCoverImage'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import SourceSelectionBox from './SourceSelectionBox'
import Database from '../../database'

/**
 * UploadTrack component
 * @param {object} props props object
 * @param {boolean} props.isOpen Indicates the visibility of the modal
 * @param {closeHandle} props.closeHandle Modal visibility handler
 * @param {Database} props.db Database object
 * @returns {Component} Component JSX
 */
const UploadTrack = ({
    isOpen,
    closeHandle,
    db
}) => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("Necunoscut");
  const defaultCoverURI = require("../../assets/images/soundure_banner_dark.png");
  const [coverURI, setCoverURI] = useState(defaultCoverURI);
  const [fileURI, setFileURI] = useState();
  const [sourceHelper, setSourceHelper] = useState("");
  const [url, setURL] = useState("");
  const [platform, setPlatform] = useState("SPOTIFY");

  const [sourceSelectionBox, toggleSourceSelectionBox] = useState(false);
  const [sheetIsOpen, toggleSheet] = useState(false);
  const [errors, setErrors] = useState({});

  const ImageNB = Factory(ImageBackground);

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
    let result = await DocumentPicker.getDocumentAsync({
      type: "audio/*"
    });

    if (result.type == "success") {
      setFileURI({ uri: result.uri });
      setSourceHelper(result.name);

      if(title === "") {
        setTitle(result.name.split(".")[0]);
      }
    }
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
    setSourceHelper("");
    setURL("");
    setPlatform("SPOTIFY");
    setErrors({})

    closeHandle(false);
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Actionsheet isOpen={sheetIsOpen} onClose={() => toggleSheet(false)}>
        <Actionsheet.Content 
          bg="primary.700"
          pb="4"
          _dragIndicatorWrapper={{ bg:"primary.700" }}
          _dragIndicator={{ bg: "primary.50" }}
        >
          <Text color="white" fontFamily="quicksand_b" fontSize="md" mb="2">Sursă piesă</Text>
          <SourceActionsheetItem text="Preia din dispozitiv" onPress={() => {
            toggleSheet(false);
            handleFileChoice();
          }}/>
          <SourceActionsheetItem text="Preia din URL" onPress={() => {
            toggleSourceSelectionBox(true);
            toggleSheet(false);
          }}/>
        </Actionsheet.Content>
      </Actionsheet>

      <Modal.Content 
          w="90%" h={`${parseInt(Dimensions.get("screen").height)}`} 
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
                      imageStyle={{height: "100%"}}
                      source={coverURI}
                      resizeMode="cover"
                  ></ImageNB>
                )
              }
            </AspectRatio>
          </ImageNB>

          <ScrollView
            w="100%"
            h="60%"
            px="5" pt="5"
            _contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: 10,
            }} 
          >
            <Text
              pb="2" mb="4"
              color="white"
              fontFamily="quicksand_b"
              fontSize="md"
              borderBottomColor="primary.600"
              borderBottomWidth="1"
            >Încarcă o piesă</Text>

            <FormControl h="35" isInvalid={"title" in errors} isRequired>
              <Input
                variant="underlined"
                placeholder="Titlu piesă"
                color="primary.50"
                borderBottomColor="primary.50"
                placeholderTextColor="gray.400"
                fontFamily="manrope_r"
                onChangeText={setTitle}
                value={title}
              />
              <FormControl.ErrorMessage mt="0">{'title' in errors ? errors.title : ""}</FormControl.ErrorMessage>
            </FormControl>

            <FormControl h="35" mt="6" isInvalid={"artist" in errors}>
              <Input
                variant="underlined"
                placeholder="Nume artist"
                color="primary.50"
                borderBottomColor="primary.50"
                placeholderTextColor="gray.400"
                fontFamily="manrope_r"
                onChangeText={setArtist}
                value={artist}
              />
              <FormControl.ErrorMessage mt="0">{'artist' in errors ? errors.artist : ""}</FormControl.ErrorMessage>
            </FormControl>

            <FormControl
              mt="6"
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

            <FormControl
              mt="6"
              isRequired
            >
              <Box
                flexDir="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <FormControl.Label _text={{
                  fontFamily: "manrope_r",
                  fontSize: "xs",
                  color: "gray.400"
                }}>Sursă piesă</FormControl.Label>

                <Button h="30"
                  p="0" px="6"
                  _text={{
                    fontFamily: "manrope_r",
                    fontSize: "xs"
                  }}
                  onPress={handleSourceChoice}
                >Alege</Button>
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

            <Button mt="6" onPress={handleSubmit} _text={{
              fontFamily: "quicksand_b"
            }}>Încarcă</Button>
          </ScrollView>
        </Box>
      </Modal.Content>
    </Modal>
  )
}

const SourceActionsheetItem = ({text, onPress}) => (
  <Actionsheet.Item
    bg="primary.700"
    borderBottomWidth="1"
    borderBottomColor="primary.200"
    onPress={onPress}
    _text={{
      color: "white",
      fontFamily: "manrope_r",
      fontSize: "xs"
    }}
  >{text}</Actionsheet.Item>
);

export default UploadTrack