import { 
  Box, 
  Text,
  FormControl,
  Input,
  Radio,
  Icon
} from 'native-base'
import React from 'react'
import CustomIcon from "../../icons"

const SourceSelectionBox = () => {
  return (
    <Box
      mt="6" p="4" pb="6"
      bg="primary.900"
      rounded="lg"
      alignItems="center"
    >
      <Text
        mb="2"
        color="white"
        fontFamily="quicksand_b"
      >
        Specifică URL sursă
      </Text>
      <FormControl isRequired>
        <Input
          h="35"
          mb="4"
          bg="primary.700"
          borderWidth="0"
          color="primary.50"
          fontFamily="manrope_r"
          placeholder="https://"
          _focus={{
            bg: "primary.700"
          }}
        ></Input>
      </FormControl>

      <Text
        mb="2"
        color="white"
        fontFamily="quicksand_b"
      >
        Specifică platformă
      </Text>

      <FormControl isRequired w="auto">
        <Radio.Group defaultValue="1">
          <SourceRadio id="spotify" name="Spotify" color="green.400" value="1" />
          <Box mb="1.5" />
          <SourceRadio id="soundcloud" name="Soundcloud" color="orange.400" value="2" />
          <Box mb="1.5" />
          <SourceRadio id="youtube" name="Youtube" color="red.400" value="3" />
        </Radio.Group>
      </FormControl>
    </Box>
  )
}

const SourceRadio = ({id, name, color, value}) => (
  <Radio
    icon={<Icon as={
      <CustomIcon name={`${id}_logo`} size={10} color="white" />
    } />}
    _checked={{ 
      bg: color,
      _icon: {
        color: "white"
      }
    }}
    _text={{
      fontFamily: "manrope_b",
      fontSize: "xs",
      color: "white",
    }}
    borderWidth="0"
    bg="primary.700"
    size="lg"
    value={value}
  >{name}</Radio>
);

export default SourceSelectionBox