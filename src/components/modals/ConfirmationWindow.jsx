import React from 'react';
import { Button, HStack, Modal } from 'native-base';


const colorTheme = {
    header: "gray.800",
    headerText: "white",
    close: "gray.500",
    body: "gray.700",
    bodyText: "gray.200",
    button: "gray.500",
    buttonText: "white"
}

/**
 * @callback toggleVisible
 * @callback onYes
 * @callback onNo
 */

/**
 * ConformationWindow component
 * 
 * @param {object} props props object
 * @param {boolean} props.isOpen Indicates modal visibility 
 * @param {toggleVisible} props.toggleVisible Toggles modal visibility
 * @param {string} [props.title] Header text
 * @param {string} [props.description] Body text
 * @param {onYes} [props.onYes] Callback to execute if Yes is pressed
 * @param {onNo} [props.onNo] Callback to execute if No is pressed
 * 
 * @returns {JSX.Element} JSX component
 */
const ConfirmationWindow = ({
    isOpen=false,
    toggleVisible,
    title="Sigur vrei să faci asta?",
    description="Dacă alegi 'Da', nu mai ai posibilitatea de a te întoarce!",
    onYes=() => {},
    onNo=() => {}
}) => {
    const handleYes = () => {
        toggleVisible(false);
        onYes();
    }

    const handleNo = () => {
        toggleVisible(false);
        onNo();
    }

    return (
        <Modal isOpen={isOpen} onOpen={() => toggleVisible(true)} onClose={() => toggleVisible(false)}>
            <Modal.Content bg={colorTheme.body}>
                <Modal.CloseButton 
                    _icon={{ color: colorTheme.close }}
                    _pressed={{ bg: colorTheme.header }}
                />
                
                <Modal.Header 
                    bg={colorTheme.header}
                    borderBottomWidth={0}
                    _text={{
                        color: "white",
                        fontFamily: "quicksand_b"
                    }}>{title}</Modal.Header>

                <Modal.Body _text={{
                    color: colorTheme.bodyText,
                    fontFamily: "manrope_r"
                }}>{description}</Modal.Body>

                <HStack w="100%" p="2" pb="4"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Button w="25%" py="1" mr="10" 
                        onPress={handleYes}
                        bg={colorTheme.button}
                        _text={{ fontFamily: "manrope_b", color: colorTheme.buttonText }}>Da</Button>

                    <Button w="25%" py="1"
                        onPress={handleNo}
                        bg={colorTheme.button}
                        _text={{ fontFamily: "manrope_b", color: colorTheme.buttonText }}>Nu</Button>
                </HStack>
            </Modal.Content>
        </Modal>
    );
};


export default ConfirmationWindow;
