import React from 'react';
import { Actionsheet, Text, HStack } from 'native-base';
import { lng } from '../../functions';


/**
 * @callback onOpen
 * @callback onClose
 * @callback onPress
 */

/**
 * CustomActionsheet component. Used for creating quick actionsheets
 * 
 * @param {object} props props object
 * @param {boolean} props.isOpen The visibility of the actionsheet
 * @param {onOpen} props.onOpen Sets the truthy value for isOpen
 * @param {onClose} props.onClose Sets the falsy value for isOpen
 * @param {string} props.title Title to display at the top of the actionsheet
 * @param {JSX.Element[]} props.children The CustomActionsheetItems to render
 * 
 * @returns {JSX.Element} JSX component
 */
const CustomActionsheet = ({
    isOpen,
    onOpen,
    onClose,
    title="",
    children
}) => {
    return (
        <Actionsheet 
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
            rounded="xs"
            _backdrop={{ opacity: 0.7 }}
        >
            <Actionsheet.Content w="auto" px="0" mx="2"
                bg={lng(["primary.700", "primary.900"])}
                _dragIndicatorWrapper={{ bg:"primary.800" }}
                _dragIndicator={{ bg: "primary.500", h: "0.5" }}
            >
                {children}
            </Actionsheet.Content>
        </Actionsheet>
    );
};


/**
 * CustomActionsheetItem component
 * 
 * @param {object} props props object
 * @param {string} props.text Item text
 * @param {onPress} props.onPress Callback to execute on item press
 * @param {string} [props.iconName] Icon name for the icon to the left of the text
 * @param {JSX.Element} [props.IconType] Icon type for the icon to the left of the text
 * @param {string|number} [props.iconSize] Icon size for the icon to the left of the text
 * 
 * @returns {JSX.Element} JSX component
 */
export const CustomActionsheetItem = ({ 
    text, 
    onPress, 
    iconName="", 
    IconType,
    iconSize="20"
}) => (
    <Actionsheet.Item py="4"
        bg="transparent"
        onPress={onPress}
        _pressed={{ opacity: 0.5, backgroundColor: "primary.900" }}
    >
        <HStack space={3} alignItems="center">
            {IconType ? <IconType name={iconName} color="primary.50" fontSize={iconSize}/> : (<></>)}
            
            <Text color="primary.50"
                fontFamily="quicksand_r"
                fontSize="sm">{text}</Text>
        </HStack>
    </Actionsheet.Item>
  );

export default CustomActionsheet;
