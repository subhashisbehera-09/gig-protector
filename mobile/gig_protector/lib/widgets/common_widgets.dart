import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class StatCard extends StatelessWidget {
  final String icon;
  final String value;
  final String label;
  final Color? valueColor;

  const StatCard({
    super.key,
    required this.icon,
    required this.value,
    required this.label,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        children: [
          Text(icon, style: const TextStyle(fontSize: 28)),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontFamily: 'Outfit',
              fontSize: 28,
              fontWeight: FontWeight.w800,
              color: valueColor ?? AppTheme.text,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: AppTheme.text2,
            ),
          ),
        ],
      ),
    );
  }
}

class Badge extends StatelessWidget {
  final String text;
  final Color backgroundColor;
  final Color textColor;

  const Badge({
    super.key,
    required this.text,
    required this.backgroundColor,
    required this.textColor,
  });

  factory Badge.green(String text) => Badge(
        text: text,
        backgroundColor: AppTheme.green.withOpacity(0.15),
        textColor: AppTheme.greenLight,
      );

  factory Badge.blue(String text) => Badge(
        text: text,
        backgroundColor: AppTheme.blue.withOpacity(0.15),
        textColor: AppTheme.blueLight,
      );

  factory Badge.orange(String text) => Badge(
        text: text,
        backgroundColor: AppTheme.orange.withOpacity(0.15),
        textColor: AppTheme.orangeLight,
      );

  factory Badge.yellow(String text) => Badge(
        text: text,
        backgroundColor: AppTheme.yellow.withOpacity(0.15),
        textColor: AppTheme.yellow,
      );

  factory Badge.teal(String text) => Badge(
        text: text,
        backgroundColor: AppTheme.teal.withOpacity(0.15),
        textColor: AppTheme.tealLight,
      );

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
          color: textColor,
        ),
      ),
    );
  }
}

class AlertBox extends StatelessWidget {
  final String message;
  final Color borderColor;
  final Color textColor;
  final IconData? icon;

  const AlertBox({
    super.key,
    required this.message,
    required this.borderColor,
    required this.textColor,
    this.icon,
  });

  factory AlertBox.success(String message) => AlertBox(
        message: message,
        borderColor: AppTheme.greenLight,
        textColor: const Color(0xFF86EFAC),
        icon: Icons.check_circle_outline,
      );

  factory AlertBox.info(String message) => AlertBox(
        message: message,
        borderColor: AppTheme.blueLight,
        textColor: const Color(0xFF93C5FD),
        icon: Icons.info_outline,
      );

  factory AlertBox.warning(String message) => AlertBox(
        message: message,
        borderColor: AppTheme.yellow,
        textColor: const Color(0xFFFCD34D),
        icon: Icons.warning_amber_outlined,
      );

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: borderColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border(
          left: BorderSide(color: borderColor, width: 3),
        ),
      ),
      child: Row(
        children: [
          if (icon != null) ...[
            Icon(icon, color: textColor, size: 18),
            const SizedBox(width: 8),
          ],
          Expanded(
            child: Text(
              message,
              style: TextStyle(fontSize: 13, color: textColor),
            ),
          ),
        ],
      ),
    );
  }
}

class HeroSection extends StatelessWidget {
  final List<Widget> tags;
  final String title;
  final String subtitle;

  const HeroSection({
    super.key,
    required this.tags,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppTheme.blue.withOpacity(0.12),
            AppTheme.teal.withOpacity(0.08),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (tags.isNotEmpty)
            Wrap(
              spacing: 8,
              children: tags.map((t) => t).toList(),
            ),
          const SizedBox(height: 12),
          Text(
            title,
            style: Theme.of(context).textTheme.headlineLarge,
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            style: const TextStyle(fontSize: 13, color: AppTheme.text2),
          ),
        ],
      ),
    );
  }
}

class TagChip extends StatelessWidget {
  final String text;
  final Color backgroundColor;
  final Color textColor;

  const TagChip({
    super.key,
    required this.text,
    required this.backgroundColor,
    required this.textColor,
  });

  factory TagChip.ml(String text) => TagChip(
        text: text,
        backgroundColor: const Color(0xFF8B5CF6).withOpacity(0.2),
        textColor: const Color(0xFFC4B5FD),
      );

  factory TagChip.api(String text) => TagChip(
        text: text,
        backgroundColor: AppTheme.teal.withOpacity(0.2),
        textColor: AppTheme.tealLight,
      );

  factory TagChip.auto(String text) => TagChip(
        text: text,
        backgroundColor: AppTheme.green.withOpacity(0.2),
        textColor: AppTheme.greenLight,
      );

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.bold,
          color: textColor,
          letterSpacing: 0.5,
        ),
      ),
    );
  }
}

class ProgressBar extends StatelessWidget {
  final double value;
  final Color color;
  final double height;

  const ProgressBar({
    super.key,
    required this.value,
    required this.color,
    this.height = 6,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: AppTheme.bg3,
        borderRadius: BorderRadius.circular(height / 2),
      ),
      child: FractionallySizedBox(
        alignment: Alignment.centerLeft,
        widthFactor: value / 100,
        child: Container(
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(height / 2),
          ),
        ),
      ),
    );
  }
}
