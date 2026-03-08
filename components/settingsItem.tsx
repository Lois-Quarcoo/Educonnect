import { View, Text, Switch, TouchableOpacity } from "react-native";
import React from "react";

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  titleClassName?: string;
  onPress?: () => void;
}

const SettingsItem = ({
  title,
  subtitle,
  showSwitch,
  switchValue,
  onSwitchChange,
  titleClassName,
  onPress,
}: SettingsItemProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      className="flex-row justify-between items-center px-4 py-4"
    >
      <View>
        <Text className={`text-base font-medium ${titleClassName ?? "text-black"}`}>
          {title}
        </Text>

        {subtitle && (
          <Text className="text-gray-400 text-sm">
            {subtitle}
          </Text>
        )}
      </View>

      {showSwitch && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
        />
      )}
    </TouchableOpacity>
  );
};

export default SettingsItem;