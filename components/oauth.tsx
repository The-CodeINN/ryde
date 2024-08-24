import React from "react";
import { Image, Text, View } from "react-native";
import CustomButton from "./customButton";
import { icons } from "@/constants";

const OAuth = () => {
  const handleGoogleSignIn = () => {
    console.log("Google Sign In");
  };
  return (
    <View>
      <View className=" flex flex-row justify-center items-center mt-4 gap-x-3">
        <View className=" flex-1 h-[1px] bg-general-100" />
        <Text className=" text-lg">Or</Text>
        <View className=" flex-1 h-[1px] bg-general-100" />
      </View>
      <CustomButton
        title="Log In with Google"
        bgVariant="outline"
        textVariant="primary"
        className=" mt-5 w-full shadow-none"
        IconLeft={() => (
          <Image resizeMode="contain" source={icons.google} className=" w-5 h-5 mx-2" />
        )}
        onPress={handleGoogleSignIn}
      />
    </View>
  );
};

export default OAuth;
