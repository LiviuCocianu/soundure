import React from 'react';
import { Actionsheet, Text } from 'native-base';


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
                bg={{
                    linearGradient: {
                        colors: ["primary.700", "primary.900"],
                        start: [0, 0.5],
                        end: [1, 0.5]
                    }
                }}
                _dragIndicatorWrapper={{ bg:"primary.800" }}
                _dragIndicator={{ bg: "primary.500", h: "0.5" }}
            >
                <Text w="100%" py="2"
                    color="primary.50"
                    textAlign="center"
                    fontFamily="quicksand_r" 
                    fontSize="sm">{title}</Text>

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
 * 
 * @returns {JSX.Element} JSX component
 */
export const CustomActionsheetItem = ({ text, onPress }) => (
    <Actionsheet.Item py="2" mb="0.5"
        bg="transparent"
        borderLeftColor="primary.800"
        borderLeftWidth="6"
        onPress={onPress}
        _pressed={{ opacity: 0.5, backgroundColor: "primary.900" }}
        _text={{ color: "primary.50", fontFamily: "quicksand_r", fontSize: "xs" }}
    >{text}</Actionsheet.Item>
  );

export default CustomActionsheet;
