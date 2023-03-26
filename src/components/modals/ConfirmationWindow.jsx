import React from 'react';
import { Button, HStack, Modal } from 'native-base';


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
            <Modal.Content bg="primary.500">
                <Modal.CloseButton _icon={{ color: "primary.100" }}/>
                <Modal.Header 
                    bg="primary.600" 
                    borderBottomColor="primary.800"
                    _text={{
                        color: "white",
                        fontFamily: "quicksand_b"
                    }}>{title}</Modal.Header>

                <Modal.Body _text={{
                    color: "primary.50",
                    fontFamily: "manrope_r"
                }}>{description}</Modal.Body>

                <HStack w="100%" p="2" pb="4"
                    justifyContent="center"
                    alignItems="center"
                >
                    <Button w="25%" py="1" mr="10" 
                        onPress={handleYes}
                        _text={{ fontFamily: "manrope_b" }}>Da</Button>

                    <Button w="25%" py="1"
                        onPress={handleNo}
                        _text={{ fontFamily: "manrope_b" }}>Nu</Button>
                </HStack>
            </Modal.Content>
        </Modal>
    );
};


export default ConfirmationWindow;
