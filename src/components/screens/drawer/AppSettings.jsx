import React, { useCallback } from 'react'
import { Box, Button, FormControl, HStack, Input, Pressable, ScrollView, Text } from 'native-base'
import { SCREEN_WITH_PLAYER_HEIGHT } from '../../../constants'
import { lng } from '../../../functions'
import Toast from 'react-native-root-toast'
import { useState } from 'react'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppSettingsBridge, resetApp } from '../../../database/componentBridge'
import RNExitApp from 'react-native-exit-app'
import db from '../../../database/database'


const DEV_MODE_REQUIRED_TAPS = 4;

const AppSettings = () => {
    const [dynMinVolume, setDynMinVolume] = useState();
    const [dynMaxVolume, setDynMaxVolume] = useState();
    const [dynSensitivity, setDynSensitivity] = useState();
    const [errors, setErrors] = useState({});
    const [changed, setChanged] = useState(new Set());
    const [devMode, toggleDevMode] = useState(false);
    const [devModeTaps, setDevModeTaps] = useState(0);

    const dispatch = useDispatch();
    const appSettings = useSelector(state => state.appSettings);

    useEffect(() => {
        setDynMinVolume(String(appSettings.dynamicMinVolume));
        setDynMaxVolume(String(appSettings.dynamicMaxVolume));
        setDynSensitivity(String(appSettings.dynamicSensitivity));
    }, [appSettings]);

    useEffect(() => {
        if(devModeTaps == 1) {
            setTimeout(() => {
                if(devModeTaps != 0)
                    setDevModeTaps(0);
            }, DEV_MODE_REQUIRED_TAPS * 500);
        }
    }, [devModeTaps]);

    const handleDevModeTaps = useCallback(() => {
        setDevModeTaps((oldTaps) => oldTaps + 1);

        if ((devModeTaps + 1) == DEV_MODE_REQUIRED_TAPS) {
            toggleDevMode(!devMode);
            setDevModeTaps(0);

            if(!devMode) {
                Toast.show("Modul dezvoltator activat");
            } else {
                Toast.show("Modul dezvoltator dezactivat");
            }
        }
    }, [devModeTaps, devMode]);

    const handleAppReset = useCallback(async () => {
        if(devModeTaps == 0) {
            Toast.show("Apasă din nou pentru a confirma");
        } else {
            await db.truncateAll();
            toggleDevMode(false);

            Toast.show("Aplicația a fost resetata! Se inchide..");

            setTimeout(() => RNExitApp.exitApp(), 1000);
        }

        setDevModeTaps((oldTaps) => oldTaps + 1);
    }, [devModeTaps]);

    const handleSubmit = useCallback(() => {
        let err = { ...errors };

        if (dynMinVolume <= 0 || dynMinVolume >= 1) {
            err = {
                ...err,
                dynMinVolume: "Valoarea nu se află între 0 și 1"
            };
        } else delete err.dynMinVolume;

        if (dynMaxVolume <= 0 || dynMaxVolume >= 1) {
            err = {
                ...err,
                dynMaxVolume: "Valoarea nu se află între 0 și 1"
            };
        } else delete err.dynMaxVolume;

        if (dynSensitivity < 200) {
            err = {
                ...err,
                dynSensitivity: "Valoarea nu poate fi mai mică decât 200"
            };
        } else delete err.dynSensitivity;

        setErrors(err);

        // All validation have passed
        if (Object.keys(err).length == 0) {
            changed.forEach(async setting => {
                let val;

                switch(setting) {
                    case "dynamicMinVolume":
                        val = dynMinVolume;
                        break;
                    case "dynamicMaxVolume":
                        val = dynMaxVolume;
                        break;
                    case "dynamicSensitivity":
                        val = dynSensitivity;
                        break;
                }

                await AppSettingsBridge.applySetting(setting, val, dispatch);
            });

            Toast.show("Setările au fost aplicate!");
        }
    }, [errors, dynMinVolume, dynMaxVolume, dynSensitivity]);

    useEffect(() => {
        let ch = new Set([...changed]);

        if (dynMinVolume != String(appSettings.dynamicMinVolume)) ch.add("dynamicMinVolume");
        else ch.delete("dynamicMinVolume");

        if (dynMaxVolume != String(appSettings.dynamicMaxVolume)) ch.add("dynamicMaxVolume");
        else ch.delete("dynamicMaxVolume");

        if (dynSensitivity != String(appSettings.dynamicSensitivity)) ch.add("dynamicSensitivity");
        else ch.delete("dynamicSensitivity");

        setChanged(ch);
    }, [dynMinVolume, dynMaxVolume, dynSensitivity, appSettings]);

    return (
        <Box w="100%" h={`${SCREEN_WITH_PLAYER_HEIGHT}px`}
            bg={lng(["gray.700", "black"], "bottom")}
        >
            <HStack w="100%" h="16%" pl="6" pt="12"
                bg={lng(["primary.900", "primary.500"], "bottom")}
            >
                <Pressable onPress={handleDevModeTaps}>
                    <Box h="100%" justifyContent="center">
                        <Text color="white"
                            fontFamily="quicksand_b"
                            fontSize="lg">Setări aplicație</Text>

                        <Text mb="2" color="white"
                            fontFamily="manrope_r"
                            fontSize="2xs">Menține apăsat pe textul unei setări pentru ajutor</Text>
                    </Box>
                </Pressable>
            </HStack>

            <ScrollView p="4">
                <SettingsSection title="Sunet dinamic">
                    <NumberSettingField 
                        title="Volum minim"
                        toast="Procentual. Aplicația nu va putea ajusta volumul redării mai jos de acest prag"
                        value={dynMinVolume}
                        setValue={setDynMinVolume}
                        changed={changed.has("dynamicMinVolume")}
                        settingName="dynMinVolume"
                        errors={errors}/>

                    <NumberSettingField
                        title="Volum maxim"
                        toast="Procentual. Aplicația nu va putea ajusta volumul redării mai sus de acest prag"
                        value={dynMaxVolume}
                        setValue={setDynMaxVolume}
                        changed={changed.has("dynamicMaxVolume")}
                        settingName="dynMaxVolume"
                        errors={errors}/>

                    <NumberSettingField
                        title="Sensibilitate"
                        toast="Cu cât mai mare valoarea, cu atât mai redusă va deveni sensibilitatea detecției puterii zgomotului de pe fundal"
                        value={dynSensitivity}
                        setValue={setDynSensitivity}
                        changed={changed.has("dynamicSensitivity")}
                        settingName="dynSensitivity"
                        errors={errors}/>
                </SettingsSection>

                <Button mt="2"
                    onPress={handleSubmit}
                    isDisabled={changed.size == 0}
                    _text={{
                        fontFamily: "quicksand_b"
                    }}>Salvează</Button>
                
                {devMode ? <SecretDevButton onPress={handleAppReset}/> : <></>}
            </ScrollView>
        </Box>
    );
}

const SettingsSection = ({
    title,
    children
}) => {
    return (
        <Box w="100%" my="4" p="2" px="4" py="4" pb="6"
            borderColor="gray.500"
            borderWidth={1}
            borderRadius="lg"
        >
            <Text mb="4" color="white"
                fontFamily="quicksand_b"
                fontSize="md">{title}</Text>
            {children}
        </Box>
    );
}

const NumberSettingField = ({
    title,
    toast,
    value,
    setValue,
    changed,
    settingName,
    errors
}) => {
    return (
        <Box w="100%" my="2">
            <Pressable onLongPress={() => Toast.show(toast, {duration: Toast.durations.LONG})}>
                <Text color="white"
                    fontStyle={changed ? "italic" : "normal"}
                    fontFamily="manrope_l"
                    fontSize="xs">{title}</Text>
            </Pressable>

            <FormControl isInvalid={settingName in errors}>
                <Input mt="1" h="8"
                    inputMode="numeric"
                    value={value}
                    onChangeText={setValue}
                    color="white"
                    borderColor="gray.500"
                    fontFamily="manrope_r"
                    _focus={{ borderColor: "gray.500" }} />

                <FormControl.ErrorMessage>
                    {settingName in errors ? errors[settingName] : ""}
                </FormControl.ErrorMessage>
            </FormControl>
        </Box>
    );
}

const SecretDevButton = ({onPress}) => {
    return <Button my="4" bg="red.600" _text={{
        fontFamily: "quicksand_b"
    }} onPress={onPress}>Resetează aplicația</Button>
}


export default AppSettings