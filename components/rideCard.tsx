import { Ride } from "@/types/type";
import { Text, View } from "react-native";

const RideCard = ({ ride }: { ride: Ride }) => {
  return (
    <View>
      <Text className="">{ride.driver.first_name}</Text>
    </View>
  );
};

export default RideCard;
