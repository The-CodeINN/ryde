import CustomButton from "@/components/customButton";
import InputField from "@/components/inputField";
import OAuth from "@/components/oauth";
import { icons, images } from "@/constants";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, ScrollView, Text, TextInputComponent, View } from "react-native";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        // See https://clerk.com/docs/custom-flows/error-handling for more info on error handling
        console.log(JSON.stringify(signInAttempt, null, 2));
        Alert.alert("Error", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].longMessage);
    }
  }, [isLoaded, form]);
  return (
    <ScrollView className=" flex-1 bg-white">
      <View className=" flex-1 bg-white">
        <View className=" relative w-full h-[200px]">
          <Image source={images.signUpCar} className=" z-0 w-full h-[250px]" />
          <Text className=" text-black text-2xl absolute bottom-5 left-5 font-JakartaSemiBold">
            Welcome 👋
          </Text>
        </View>
        <View className=" flex flex-col p-5">
          <InputField
            label={"Email"}
            placeholder="Enter your email"
            icon={icons.email}
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
          />
          <InputField
            label={"Password"}
            placeholder="Enter your password"
            icon={icons.lock}
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
            secureTextEntry
          />

          <CustomButton title="Sign In" onPress={onSignInPress} className=" mt-6" />

          {/* OAuth  */}
          <OAuth />

          <Link href="/sign-up" className=" text-lg text-center text-general-200 mt-10">
            <Text>Don't have an account?</Text>
            <Text className=" text-primary-500">Sign Up</Text>
          </Link>
        </View>

        {/* Verify modal */}
      </View>
    </ScrollView>
  );
};

export default SignIn;
