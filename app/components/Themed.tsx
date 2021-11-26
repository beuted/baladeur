/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */

import * as React from 'react';
import { Button, StyleProp, Text as DefaultText, TouchableOpacity, View as DefaultView, ViewStyle } from 'react-native';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];
export type ButtonProps = ThemeProps & Button['props'] & { style?: StyleProp<ViewStyle> };

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function ThemedButton(props: ButtonProps) {
  const { lightColor, darkColor, title, onPress, style, color, ...otherProps } = props;
  const tintColor = useThemeColor({ light: lightColor, dark: darkColor }, 'tint');
  const bgColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  const backgroundColor = (color == "primary") ? tintColor : bgColor;
  const textColor = (color == "primary") ? bgColor : tintColor;;
  return (<TouchableOpacity style={[{ backgroundColor: backgroundColor, padding: 10, borderRadius: 20, elevation: 2, minWidth: 60, }, props.style]} onPress={onPress} activeOpacity={0.8} >
    <Text style={{ color: textColor, fontSize: 18, textAlign: 'center' }}> {title}</Text>
  </TouchableOpacity >)
}
