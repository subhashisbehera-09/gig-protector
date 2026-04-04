import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/common_widgets.dart';

class PremiumScreen extends StatefulWidget {
  const PremiumScreen({super.key});

  @override
  State<PremiumScreen> createState() => _PremiumScreenState();
}

class _PremiumScreenState extends State<PremiumScreen> {
  String _cityTier = 'tier1';
  double _zoneRisk = 1.3;
  String _coverageTier = 'standard';
  int _earnings = 4500;
  int _tenure = 14;
  double _loyalty = 0.05;

  int _calculatePremium() {
    final cityBase = {'tier1': 70, 'tier2': 50, 'tier3': 38};
    final base = cityBase[_cityTier] ?? 70;
    final tierMultiplier = {'basic': 0.85, 'standard': 1.0, 'premium': 1.25}[_coverageTier] ?? 1.0;
    return (base * _zoneRisk * tierMultiplier * (1 - _loyalty)).round();
  }

  @override
  Widget build(BuildContext context) {
    final premium = _calculatePremium();

    final featureBars = [
      {'name': 'Zone Flood Risk History', 'pct': 72, 'color': AppTheme.orange},
      {'name': 'Seasonal Risk (Monsoon)', 'pct': 65, 'color': AppTheme.blueLight},
      {'name': 'Worker Earnings Volatility', 'pct': 28, 'color': AppTheme.tealLight},
      {'name': '14-Day Disruption Forecast', 'pct': 58, 'color': AppTheme.yellow},
      {'name': 'Platform Tenure', 'pct': 22, 'color': AppTheme.greenLight},
      {'name': 'Zone Pollution Sink Score', 'pct': 18, 'color': const Color(0xFFA78BFA)},
    ];

    final mlAdjustments = [
      {'desc': 'Zone historically waterlogged 18+ days/year', 'adj': '+₹8/week', 'dir': 'up'},
      {'desc': 'No waterlogging in Colaba equivalent zones', 'adj': '−₹14/week', 'dir': 'down'},
      {'desc': 'Monsoon season active (Jun-Sep)', 'adj': '+₹6/week', 'dir': 'up'},
      {'desc': 'Worker has 14 months consistent history', 'adj': '−₹4/week', 'dir': 'down'},
      {'desc': 'Zone AQI historically below 150', 'adj': '−₹3/week', 'dir': 'down'},
    ];

    final days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final probs = [0.82, 0.76, 0.91, 0.85, 0.42, 0.38, 0.65, 0.71, 0.88, 0.93, 0.67, 0.44, 0.35, 0.51];

    return Scaffold(
      appBar: AppBar(title: const Text('Premium Calculator')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            HeroSection(
              tags: [TagChip.ml('ML MODEL'), TagChip.api('LIVE APIS')],
              title: 'Dynamic Premium Calculator',
              subtitle: 'XGBoost model - 14 hyper-local features. Premium updates every 4 weeks.',
            ),
            const SizedBox(height: 20),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    children: [
                      _buildCard([
                        const Text('Worker Profile Inputs', style: TextStyle(fontWeight: FontWeight.w700)),
                        const SizedBox(height: 16),
                        DropdownButtonFormField<String>(
                          value: _cityTier,
                          decoration: const InputDecoration(labelText: 'City Tier'),
                          items: const [
                            DropdownMenuItem(value: 'tier1', child: Text('Tier 1 (₹70 base)')),
                            DropdownMenuItem(value: 'tier2', child: Text('Tier 2 (₹50 base)')),
                            DropdownMenuItem(value: 'tier3', child: Text('Tier 3 (₹38 base)')),
                          ],
                          onChanged: (v) => setState(() => _cityTier = v!),
                        ),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<double>(
                          value: _zoneRisk,
                          decoration: const InputDecoration(labelText: 'Zone Risk'),
                          items: const [
                            DropdownMenuItem(value: 0.8, child: Text('Low Risk (0.8x)')),
                            DropdownMenuItem(value: 1.0, child: Text('Medium Risk (1.0x)')),
                            DropdownMenuItem(value: 1.3, child: Text('High Risk (1.3x)')),
                            DropdownMenuItem(value: 1.5, child: Text('Extreme Risk (1.5x)')),
                          ],
                          onChanged: (v) => setState(() => _zoneRisk = v!),
                        ),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<String>(
                          value: _coverageTier,
                          decoration: const InputDecoration(labelText: 'Coverage Tier'),
                          items: const [
                            DropdownMenuItem(value: 'basic', child: Text('Basic Shield - 60%')),
                            DropdownMenuItem(value: 'standard', child: Text('Standard Shield - 75%')),
                            DropdownMenuItem(value: 'premium', child: Text('Premium Shield - 90%')),
                          ],
                          onChanged: (v) => setState(() => _coverageTier = v!),
                        ),
                        const SizedBox(height: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Weekly Earnings: ₹$_earnings', style: const TextStyle(fontSize: 12)),
                            Slider(
                              value: _earnings.toDouble(),
                              min: 1500,
                              max: 9000,
                              divisions: 75,
                              onChanged: (v) => setState(() => _earnings = v.round()),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<double>(
                          value: _loyalty,
                          decoration: const InputDecoration(labelText: 'Loyalty Discount'),
                          items: const [
                            DropdownMenuItem(value: 0.0, child: Text('0% (new)')),
                            DropdownMenuItem(value: 0.05, child: Text('5% (Q2)')),
                            DropdownMenuItem(value: 0.1, child: Text('10% (Q3)')),
                            DropdownMenuItem(value: 0.2, child: Text('20% (Q4+)')),
                          ],
                          onChanged: (v) => setState(() => _loyalty = v!),
                        ),
                      ]),
                      const SizedBox(height: 16),
                      _buildCard([
                        Row(
                          children: [
                            const Text('ML Feature Contributions', style: TextStyle(fontWeight: FontWeight.w600)),
                            const SizedBox(width: 8),
                            TagChip.ml('XGBoost'),
                          ],
                        ),
                        const SizedBox(height: 16),
                        ...featureBars.map((f) => _buildFeatureBar(f)),
                      ]),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            _buildCard([
              const Text('Premium Breakdown', style: TextStyle(fontWeight: FontWeight.w700)),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: AppTheme.bg3,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  children: [
                    const Text('Your Weekly Premium', style: TextStyle(fontSize: 11, color: AppTheme.text3, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text('₹$premium', style: const TextStyle(fontFamily: 'Outfit', fontSize: 48, fontWeight: FontWeight.w800, color: AppTheme.blueLight)),
                    Text('≈ ₹${premium * 4}/month', style: const TextStyle(fontSize: 12, color: AppTheme.text2)),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              _buildBreakdownRow('Base Rate (City Tier)', '₹${_cityTier == 'tier1' ? 70 : _cityTier == 'tier2' ? 50 : 38}'),
              _buildBreakdownRow('Zone Risk Multiplier', '${_zoneRisk}x'),
              _buildBreakdownRow('Coverage Tier Factor', '${_coverageTier == 'basic' ? 0.85 : _coverageTier == 'standard' ? 1.0 : 1.25}x'),
              _buildBreakdownRow('Loyalty Discount', '−${(_loyalty * 100).toInt()}%'),
              const Divider(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Final Weekly Premium', style: TextStyle(fontWeight: FontWeight.w600)),
                  Text('₹$premium', style: const TextStyle(fontWeight: FontWeight.w600, color: AppTheme.blueLight)),
                ],
              ),
            ]),
            const SizedBox(height: 16),
            _buildCard([
              Row(
                children: [
                  const Text('ML Hyper-Local Adjustments', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(width: 8),
                  TagChip.ml('AI Pricing'),
                ],
              ),
              const SizedBox(height: 12),
              const AlertBox.info('The XGBoost model applies micro-adjustments based on hyper-local historical data'),
              const SizedBox(height: 12),
              ...mlAdjustments.map((a) => _buildAdjustmentRow(a)),
            ]),
            const SizedBox(height: 16),
            _buildCard([
              Row(
                children: [
                  const Text('14-Day Disruption Forecast', style: TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(width: 8),
                  TagChip.api('Weather API'),
                ],
              ),
              const SizedBox(height: 16),
              SizedBox(
                height: 80,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: List.generate(14, (idx) {
                    final prob = probs[idx];
                    return Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Container(
                          width: 16,
                          height: (prob * 64).roundToDouble(),
                          decoration: BoxDecoration(
                            color: prob > 0.7 ? AppTheme.orange : (prob > 0.5 ? AppTheme.yellow : AppTheme.green),
                            borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(days[idx], style: const TextStyle(fontSize: 10, color: AppTheme.text2)),
                      ],
                    );
                  }),
                ),
              ),
              const SizedBox(height: 12),
              const Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('High (>70%)', style: TextStyle(fontSize: 10, color: AppTheme.text2)),
                  Text('Medium (50-70%)', style: TextStyle(fontSize: 10, color: AppTheme.text2)),
                  Text('Low (<50%)', style: TextStyle(fontSize: 10, color: AppTheme.text2)),
                ],
              ),
              const SizedBox(height: 16),
              const AlertBox.warning('Monsoon season active. Premium includes +₹8 seasonal adjustment.'),
            ]),
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

  Widget _buildFeatureBar(Map<String, dynamic> bar) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(bar['name'] as String, style: const TextStyle(fontSize: 12, color: AppTheme.text2)),
              Text('${bar['pct']}%', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 6),
          ProgressBar(value: (bar['pct'] as int).toDouble(), color: bar['color'] as Color),
        ],
      ),
    );
  }

  Widget _buildBreakdownRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 13)),
          Text(value, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildAdjustmentRow(Map<String, dynamic> adj) {
    final isUp = adj['dir'] == 'up';
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Text(isUp ? '↑' : '↓', style: TextStyle(color: isUp ? AppTheme.orange : AppTheme.greenLight)),
          const SizedBox(width: 8),
          Expanded(child: Text(adj['desc'] as String, style: const TextStyle(fontSize: 13))),
          Text(adj['adj'] as String, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: isUp ? AppTheme.orange : AppTheme.greenLight)),
        ],
      ),
    );
  }
}
