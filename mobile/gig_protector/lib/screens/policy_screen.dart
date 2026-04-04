import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/common_widgets.dart';

class PolicyScreen extends StatelessWidget {
  const PolicyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = context.watch<AppState>();

    final tiers = [
      {'id': 'basic', 'emoji': '🥉', 'name': 'BASIC', 'premium': 72, 'coverage': 60, 'maxPayout': '₹2,400/week'},
      {'id': 'standard', 'emoji': '🥈', 'name': 'STANDARD', 'premium': 91, 'coverage': 75, 'maxPayout': '₹3,000/week', 'selected': true},
      {'id': 'premium', 'emoji': '🥇', 'name': 'PREMIUM', 'premium': 108, 'coverage': 90, 'maxPayout': '₹3,600/week'},
    ];

    final coverageItems = [
      {'icon': '🌧️', 'name': 'Heavy Rainfall / Flood', 'threshold': '>64.5mm/24h (IMD Red Alert)'},
      {'icon': '😷', 'name': 'Severe Air Pollution', 'threshold': 'AQI >400 + GRAP Stage IV'},
      {'icon': '🚫', 'name': 'Civic Disruption / Bandh', 'threshold': 'Zone orders <15% for 4+ hrs'},
      {'icon': '🌡️', 'name': 'Extreme Heat', 'threshold': '>44°C for 2+ consecutive days'},
      {'icon': '🌫️', 'name': 'Dense Fog', 'threshold': 'Visibility <200m for 4+ hrs'},
      {'icon': '🌀', 'name': 'Cyclone / Storm', 'threshold': 'Category 2+ within 150km'},
      {'icon': '🏔️', 'name': 'Earthquake Aftermath', 'threshold': 'NDRF zone closure declared'},
    ];

    final selectedTier = tiers.firstWhere(
      (t) => t['id'] == appState.selectedTier,
      orElse: () => tiers[1],
    );
    final maxPayout = ((appState.dailyBaseline * (selectedTier['coverage'] as int) / 100) * 7).round();

    return Scaffold(
      appBar: AppBar(title: const Text('Insurance Policy')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            HeroSection(
              tags: [TagChip.auto('STEP 2 OF 4')],
              title: 'Insurance Policy Management',
              subtitle: 'Choose your coverage tier. Auto-renews weekly via UPI AutoPay.',
            ),
            const SizedBox(height: 24),
            Text('Choose Coverage Tier', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 12),
            ...tiers.map((tier) => _buildTierCard(context, appState, tier)),
            const SizedBox(height: 24),
            Text('Active Policy Details', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 12),
            _buildCard([
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Policy #GIG-POL-7842-2024', style: TextStyle(fontWeight: FontWeight.w600)),
                  Badge.green('● ACTIVE'),
                ],
              ),
              const Divider(height: 24),
              _buildPolicyRow('Worker', appState.workerName),
              _buildPolicyRow('Platform', _getPlatformEmoji(appState.platform)),
              _buildPolicyRow('Zone', '${appState.zone.substring(0, 1).toUpperCase()}${appState.zone.substring(1)}, ${appState.city.substring(0, 1).toUpperCase()}${appState.city.substring(1)}'),
              _buildPolicyRow('Coverage Tier', '${selectedTier['name']} Shield (${selectedTier['coverage']}%)', badge: Badge.blue('${selectedTier['name']}')),
              _buildPolicyRow('Weekly Premium', '₹${selectedTier['premium']}', valueColor: AppTheme.blueLight),
              _buildPolicyRow('Next Auto-Debit', 'Monday, Apr 7 via UPI'),
              _buildPolicyRow('Policy Start', 'Jan 1, 2024'),
              _buildPolicyRow('Loyalty Discount', '−5% (Q2)', badge: Badge.teal('−5%')),
            ]),
            const SizedBox(height: 24),
            _buildCard([
              const Text('Maximum Weekly Payout', style: TextStyle(fontSize: 11, color: AppTheme.text3, fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              Text('₹$maxPayout', style: const TextStyle(fontFamily: 'Outfit', fontSize: 42, fontWeight: FontWeight.w800, color: AppTheme.blueLight)),
              const SizedBox(height: 4),
              Text('at ${selectedTier['coverage']}% of ₹${0} daily baseline', style: const TextStyle(fontSize: 12, color: AppTheme.text2)),
              const SizedBox(height: 16),
              ProgressBar(value: (selectedTier['coverage'] as int).toDouble(), color: AppTheme.greenLight),
              const SizedBox(height: 8),
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Coverage Ratio', style: TextStyle(fontSize: 12, color: AppTheme.text2)),
                  Text('Excellent', style: TextStyle(fontSize: 12, color: AppTheme.greenLight)),
                ],
              ),
              const SizedBox(height: 16),
              AlertBox.success('UPI AutoPay mandate active - premiums auto-debit every Monday'),
            ]),
            const SizedBox(height: 24),
            Text('Disruptions Covered', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 12),
            ...coverageItems.map((item) => _buildCoverageItem(item)),
            const SizedBox(height: 16),
            _buildCard([
              const Text("What's NOT Covered", style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              const AlertBox(
                message: 'This is a pure income protection product.',
                borderColor: AppTheme.red,
                textColor: Color(0xFFFCA5A5),
                icon: Icons.warning_amber_outlined,
              ),
              _buildNotCoveredItem('Health / life insurance'),
              _buildNotCoveredItem('Vehicle repair or damage'),
              _buildNotCoveredItem('Accident or injury cover'),
              _buildNotCoveredItem('Medical expenses'),
              _buildNotCoveredItem('Property damage'),
            ]),
          ],
        ),
      ),
    );
  }

  Widget _buildTierCard(BuildContext context, AppState appState, Map<String, dynamic> tier) {
    final isSelected = appState.selectedTier == tier['id'];
    return GestureDetector(
      onTap: () {
        appState.setSelectedTier(tier['id'] as String);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Switched to ${tier['name']} Shield - premium updated to ₹${tier['premium']}/week'),
            backgroundColor: AppTheme.green,
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.blue.withOpacity(0.06) : AppTheme.card,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isSelected ? AppTheme.blueLight : AppTheme.border,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Text(tier['emoji'] as String, style: const TextStyle(fontSize: 28)),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(tier['name'] as String, style: const TextStyle(fontWeight: FontWeight.w700)),
                      ),
                      if (isSelected) Badge.blue('SELECTED ✓'),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text('₹${tier['premium']}/week', style: const TextStyle(fontFamily: 'Outfit', fontSize: 24, fontWeight: FontWeight.w800, color: AppTheme.blueLight)),
                  const SizedBox(height: 4),
                  Text('${tier['coverage']}% income replacement | Max: ${tier['maxPayout']}', style: const TextStyle(fontSize: 11, color: AppTheme.text2)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard(List<Widget> children) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: children,
      ),
    );
  }

  Widget _buildPolicyRow(String label, dynamic value, {Color? valueColor, Widget? badge}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13, color: AppTheme.text2)),
          badge ?? Text(
            value.toString(),
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: valueColor),
          ),
        ],
      ),
    );
  }

  Widget _buildCoverageItem(Map<String, dynamic> item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        children: [
          Text(item['icon'] as String, style: const TextStyle(fontSize: 24)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(item['name'] as String, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                Text(item['threshold'] as String, style: const TextStyle(fontSize: 11, color: AppTheme.text2)),
              ],
            ),
          ),
          Badge.green('✓ Covered'),
        ],
      ),
    );
  }

  Widget _buildNotCoveredItem(String text) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          const Text('✗', style: TextStyle(color: AppTheme.red, fontSize: 13)),
          const SizedBox(width: 8),
          Text(text, style: const TextStyle(fontSize: 13, color: AppTheme.text2)),
        ],
      ),
    );
  }

  String _getPlatformEmoji(String platform) {
    switch (platform) {
      case 'zomato':
        return '🍕 Zomato';
      case 'swiggy':
        return '🧡 Swiggy';
      case 'zepto':
        return '⚡ Zepto';
      case 'amazon':
        return '📦 Amazon Flex';
      case 'dunzo':
        return '🏃 Dunzo';
      default:
        return platform;
    }
  }
}
