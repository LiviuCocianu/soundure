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
} from 'native-base'

import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { useDispatch } from 'react-redux'
import { trackAdded } from '../../redux/slices/trackSlice'

import SourceSelectionBox from '../general/SourceSelectionBox'
import NoCoverImage from '../general/NoCoverImage'
import db from "../../database/database"
import { handleCoverURI } from '../../functions'
import CustomActionsheet, { CustomActionsheetItem } from '../general/CustomActionsheet'


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
  const defaultCoverURI = require("../../../assets/images/soundure_banner_dark.png");
  const ImageNB = Factory(ImageBackground);
  const screenHeight = parseInt(Dimensions.get("screen").height);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("Necunoscut");
  const [coverURI, setCoverURI] = useState(undefined);
  const [fileURI, setFileURI] = useState(null);
  const [url, setURL] = useState("");
  const [platform, setPlatform] = useState("NONE");

  const [sourceHelper, setSourceHelper] = useState("");
  const [sourceSelectionBox, toggleSourceSelectionBox] = useState(false);
  const [sheetIsOpen, toggleSheet] = useState(false);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();

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
      setFileURI(result.uri);
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

    if (fileURI == null) {
      err = {
        ...err,
        fileURI: "Încărcați un fișier audio!"
      };
    } else {
      db.existsIn("Track", "fileURI = ?", [fileURI]).then(exists => {
        if(exists) {
          err = {
            ...err,
            fileURI: "O piesă la acestă locație este deja încărcată!"
          };
        } else delete err.fileURI;
      });
    }

    setErrors(err);

    // All validation have passed
    if (Object.keys(err).length == 0) {
      db.insertIfNotExists("Artist", { name: artist }, "name = ?", [artist]).then(() => {
        db.selectFrom("Artist", null, "name = ?", [artist]).then(rows => {
          const artistId = rows[0].id;
          let toInsert = { title, fileURI, platform, artistId };

          if(coverURI) {
            toInsert.coverURI = JSON.stringify(coverURI);
          }

          db.insertInto("Track", toInsert)
            .then(rs => {
              const payload = { id: rs.insertId, ...toInsert };
              dispatch(trackAdded(payload));
            })
            .catch(err => console.log(err));
        });
      });

      handleClose();
    }
  }
  
  const handleClose = () => {
    setTitle("");
    setArtist("Necunoscut");
    setCoverURI(undefined);
    setFileURI(null);
    setURL("");
    setPlatform("NONE");

    setSourceHelper("");
    setErrors({});
    toggleSourceSelectionBox(false);

    closeHandle(false);
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <CustomActionsheet
        title="Sursă piesă"
        isOpen={sheetIsOpen}
        onClose={() => toggleSheet(false)}
      >
        <CustomActionsheetItem text="Preia din dispozitiv" onPress={handleFileChoice}/>
        <CustomActionsheetItem text="Preia din URL" onPress={handleFileURLChoice}/>
      </CustomActionsheet>

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
            source={handleCoverURI(coverURI, defaultCoverURI)}
            overflow="hidden"
            blurRadius={10}
          >
            <AspectRatio ratio="4/4" h="100%" alignSelf="center">
              {
                !coverURI ? (
                  <NoCoverImage/>
                ) : (
                  <ImageNB
                      source={handleCoverURI(coverURI, defaultCoverURI)}
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

            <FormControl mt="6" isRequired isInvalid={"fileURI" in errors}>
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
              <FormControl.ErrorMessage mt="0">
                {'fileURI' in errors ? errors.fileURI : ""}
              </FormControl.ErrorMessage>
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
              ) : <></>
            }

            <Button mt="6" onPress={handleSubmit} 
              _text={{ fontFamily: "quicksand_b" }}>Încarcă</Button>
          </ScrollView>
        </Box>
      </Modal.Content>
    </Modal>
  )
}


export default UploadTrack