import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import React, { useState, useCallback } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/customButton";
import InputField from "@/components/inputField";
import OAuth from "@/components/oauth";
import { icons, images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const validateForm = useCallback(() => {
    let isValid = true;
    const newErrors = { name: "", email: "", password: "", confirmPassword: "" };

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [form]);

  const onSignUpPress = async () => {
    if (!isLoaded || !validateForm()) return;

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({
        ...verification,
        state: "pending",
        error: "",
      });
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      if (err.errors) {
        const newErrors = { ...errors };
        err.errors.forEach((error: any) => {
          if (error.meta?.paramName === "email_address") {
            newErrors.email = error.longMessage;
          } else if (error.meta?.paramName === "password") {
            newErrors.password = error.longMessage;
            newErrors.confirmPassword = error.longMessage;
          }
        });
        setErrors(newErrors);
      } else {
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setIsVerifying(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });
      if (completeSignUp.status === "complete") {
        // User verified successfully, now add to database
        try {
          await fetchAPI("/(api)/user", {
            method: "POST",
            body: JSON.stringify({
              name: form.name,
              email: form.email,
              clerkId: completeSignUp.createdUserId,
            }),
          });
          await setActive({ session: completeSignUp.createdSessionId });
          setVerification({
            ...verification,
            state: "success",
            error: "",
          });
          setShowSuccessModal(true);
        } catch (dbError) {
          console.error("Database error:", dbError);
          setVerification({
            ...verification,
            error:
              "Account verified, but there was an error creating your profile. Please contact support.",
          });
        }
      } else {
        setVerification({
          ...verification,
          error: "Verification failed. Please check the code and try again.",
        });
      }
    } catch (err: any) {
      console.log("Verification error:", err);
      setVerification({
        ...verification,
        error: err.errors?.[0]?.longMessage || "Verification failed. Please try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Create Your Account
          </Text>
        </View>
        <View className="p-5">
          <InputField
            label="Name"
            placeholder="Enter name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
            errorMessage={errors.name}
          />

          <InputField
            label="Email"
            placeholder="Enter email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
            errorMessage={errors.email}
          />

          <InputField
            label="Password"
            placeholder="Enter password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="newPassword"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
            errorMessage={errors.password}
          />

          <InputField
            label="Confirm Password"
            placeholder="Confirm password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="newPassword"
            value={form.confirmPassword}
            onChangeText={(value) => setForm({ ...form, confirmPassword: value })}
            errorMessage={errors.confirmPassword}
          />

          <CustomButton title="Sign Up" onPress={onSignUpPress} className="mt-6" />
          <OAuth />
          <Link href="/sign-in" className="text-lg text-center text-general-200 mt-10">
            Already have an account? <Text className="text-primary-500">Log In</Text>
          </Link>
        </View>
        <ReactNativeModal
          isVisible={verification.state === "pending"}
          onBackdropPress={() => {}} // Prevent closing on backdrop press
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="font-JakartaExtraBold text-2xl mb-2">Verification</Text>
            <Text className="font-JakartaMedium mb-5">
              We've sent a verification code to {form.email}.
            </Text>
            <InputField
              label="Code"
              icon={icons.lock}
              placeholder="12345"
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) => setVerification({ ...verification, code })}
              errorMessage={verification.error}
            />
            <CustomButton
              title={isVerifying ? "Verifying..." : "Verify Email"}
              onPress={onPressVerify}
              className="mt-5 bg-success-500"
              disabled={isVerifying}
            />
          </View>
        </ReactNativeModal>
        <ReactNativeModal
          isVisible={showSuccessModal}
          onBackdropPress={() => setShowSuccessModal(false)}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image source={images.check} className="w-[110px] h-[110px] mx-auto my-5" />
            <Text className="text-3xl font-JakartaBold text-center">Verified</Text>
            <Text className="text-base text-gray-400 font-JakartaMedium text-center mt-2">
              You have successfully verified your account.
            </Text>
            <CustomButton
              title="Browse Home"
              onPress={() => router.push(`/(root)/(tabs)/home`)}
              className="mt-5"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;
