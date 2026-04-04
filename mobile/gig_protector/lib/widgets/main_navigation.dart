import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/app_state.dart';
import '../theme/app_theme.dart';

class MainNavigation extends StatelessWidget {
  const MainNavigation({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AppState>(
      builder: (context, appState, _) {
        return Scaffold(
          body: IndexedStack(
            index: appState.currentPage,
            children: const [
              RegisterScreen(),
              PolicyScreen(),
              PremiumScreen(),
              ClaimsScreen(),
              TriggersScreen(),
              DashboardScreen(),
            ],
          ),
          bottomNavigationBar: Container(
            decoration: const BoxDecoration(
              color: AppTheme.bg,
              border: Border(
                top: BorderSide(color: AppTheme.border),
              ),
            ),
            child: SafeArea(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _NavItem(
                      icon: Icons.person_add_outlined,
                      label: 'Register',
                      isActive: appState.currentPage == 0,
                      onTap: () => appState.setCurrentPage(0),
                    ),
                    _NavItem(
                      icon: Icons.shield_outlined,
                      label: 'Policy',
                      isActive: appState.currentPage == 1,
                      onTap: () => appState.setCurrentPage(1),
                    ),
                    _NavItem(
                      icon: Icons.currency_rupee_outlined,
                      label: 'Premium',
                      isActive: appState.currentPage == 2,
                      onTap: () => appState.setCurrentPage(2),
                    ),
                    _NavItem(
                      icon: Icons.receipt_long_outlined,
                      label: 'Claims',
                      isActive: appState.currentPage == 3,
                      onTap: () => appState.setCurrentPage(3),
                    ),
                    _NavItem(
                      icon: Icons.flash_on_outlined,
                      label: 'Triggers',
                      badge: appState.alertCount > 0 ? appState.alertCount.toString() : null,
                      isActive: appState.currentPage == 4,
                      onTap: () => appState.setCurrentPage(4),
                    ),
                    _NavItem(
                      icon: Icons.dashboard_outlined,
                      label: 'Dashboard',
                      isActive: appState.currentPage == 5,
                      onTap: () => appState.setCurrentPage(5),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;
  final String? badge;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.onTap,
    this.badge,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: SizedBox(
        width: 56,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Icon(
                  icon,
                  color: isActive ? AppTheme.blueLight : AppTheme.text3,
                  size: 24,
                ),
                if (badge != null)
                  Positioned(
                    right: -8,
                    top: -4,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                      decoration: BoxDecoration(
                        color: AppTheme.green,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Text(
                        badge!,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                color: isActive ? AppTheme.blueLight : AppTheme.text3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
