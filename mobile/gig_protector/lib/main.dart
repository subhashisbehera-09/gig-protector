import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'models/app_state.dart';
import 'theme/app_theme.dart';
import 'screens/register_screen.dart';
import 'screens/policy_screen.dart';
import 'screens/premium_screen.dart';
import 'screens/claims_screen.dart';
import 'screens/triggers_screen.dart';
import 'screens/dashboard_screen.dart';
import 'widgets/main_navigation.dart';

void main() {
  runApp(const GigProtectorApp());
}

class GigProtectorApp extends StatelessWidget {
  const GigProtectorApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppState(),
      child: MaterialApp(
        title: 'GigProtector',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        home: const MainNavigation(),
        routes: {
          '/register': (_) => const RegisterScreen(),
          '/policy': (_) => const PolicyScreen(),
          '/premium': (_) => const PremiumScreen(),
          '/claims': (_) => const ClaimsScreen(),
          '/triggers': (_) => const TriggersScreen(),
          '/dashboard': (_) => const DashboardScreen(),
        },
      ),
    );
  }
}
