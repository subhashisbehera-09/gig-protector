import 'package:flutter/material.dart';

class AppTheme {
  static const Color bg = Color(0xFF0A0F1E);
  static const Color bg2 = Color(0xFF111827);
  static const Color bg3 = Color(0xFF1A2235);
  static const Color card = Color(0xFF161D2E);
  static const Color border = Color(0xFF1E2D45);
  static const Color blue = Color(0xFF2563EB);
  static const Color blueLight = Color(0xFF3B82F6);
  static const Color teal = Color(0xFF0D9488);
  static const Color tealLight = Color(0xFF14B8A6);
  static const Color orange = Color(0xFFEA580C);
  static const Color orangeLight = Color(0xFFF97316);
  static const Color green = Color(0xFF16A34A);
  static const Color greenLight = Color(0xFF22C55E);
  static const Color red = Color(0xFFDC2626);
  static const Color yellow = Color(0xFFD97706);
  static const Color text = Color(0xFFF1F5F9);
  static const Color text2 = Color(0xFF94A3B8);
  static const Color text3 = Color(0xFF64748B);

  static ThemeData darkTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: bg,
    primaryColor: blue,
    colorScheme: const ColorScheme.dark(
      primary: blueLight,
      secondary: tealLight,
      surface: card,
      error: red,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: bg,
      elevation: 0,
      centerTitle: true,
      titleTextStyle: TextStyle(
        color: text,
        fontSize: 18,
        fontWeight: FontWeight.w600,
        fontFamily: 'Outfit',
      ),
    ),
    cardTheme: CardTheme(
      color: card,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: const BorderSide(color: border),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: blue,
        foregroundColor: text,
        padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(9),
        ),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: bg3,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: blueLight),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
    ),
    textTheme: const TextTheme(
      headlineLarge: TextStyle(
        fontFamily: 'Outfit',
        fontSize: 28,
        fontWeight: FontWeight.w800,
        color: text,
      ),
      headlineMedium: TextStyle(
        fontFamily: 'Outfit',
        fontSize: 20,
        fontWeight: FontWeight.w700,
        color: text,
      ),
      titleMedium: TextStyle(
        fontFamily: 'Outfit',
        fontSize: 15,
        fontWeight: FontWeight.w600,
        color: text,
      ),
      bodyLarge: TextStyle(fontSize: 14, color: text),
      bodyMedium: TextStyle(fontSize: 13, color: text2),
      labelSmall: TextStyle(
        fontSize: 11,
        fontWeight: FontWeight.w600,
        color: text3,
        letterSpacing: 0.8,
      ),
    ),
    dividerTheme: const DividerThemeData(
      color: border,
      thickness: 1,
    ),
  );
}
