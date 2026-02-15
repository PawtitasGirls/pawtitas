import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "./Suscripciones.styles";

const prestadorPlans = [
  {
    name: "Plan Básico",
    price: "$8.000",
    period: "/mes",
    recommended: false,
  },
  {
    name: "Plan Premium",
    price: "$10.000",
    period: "/mes",
    recommended: true,
  },
];

const duenioBullets = [
  "Sin suscripción mensual",
  "Registro gratuito",
  "Comisión por cada reserva",
];

export default function Suscripciones({ scrollToSection }) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Suscripciones</Text>
        <Text style={styles.subtitle}>
          Elegí cómo querés usar Pawtitas y encontrá la opción ideal para vos
        </Text>
      </View>

      <View style={styles.plansWrapper}>
        <View style={styles.duenioInfoSection}>
          <View style={styles.duenioInfoCard}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>🐾</Text>
              <Text style={styles.categoryTitle}>¿Sos dueño de una mascota?</Text>
            </View>
            <Text style={styles.duenioInfoSubtitle}>
            Accedé a Pawtitas gratis y pagá solo cuando hacés una reserva
            </Text>
            <View style={styles.duenioBullets}>
              {duenioBullets.map((bullet, idx) => (
                <View key={idx} style={styles.duenioBulletRow}>
                  <Text style={styles.duenioBulletIcon}>✓</Text>
                  <Text style={styles.duenioBulletText}>{bullet}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity
              style={styles.duenioCta}
              onPress={() => scrollToSection?.("contacto")}
            >
              <Text style={styles.duenioCtaText}>Accedé gratis</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.prestadorInfoSection}>
          <View style={styles.prestadorInfoCard}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>💼</Text>
              <Text style={styles.categoryTitle}>¿Sos prestador de servicios?</Text>
            </View>
            <Text style={styles.prestadorSubtitle}>
              Elegí el plan que mejor se adapte a tu actividad y potenciá tu crecimiento
            </Text>
            <View style={styles.cardsRow}>
              {prestadorPlans.map((plan, planIdx) => (
                <View
                  key={planIdx}
                  style={[
                    styles.planCard,
                    plan.recommended && styles.planCardRecommendedPrestador,
                  ]}
                >
                  {plan.recommended && (
                    <View style={styles.recommendedBadgePrestador}>
                      <Text style={styles.recommendedText}>Recomendado</Text>
                    </View>
                  )}

                  <View style={styles.planHeader}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.priceContainer}>
                      <Text style={[styles.planPrice, styles.planPricePrestador]}>
                        {plan.price}
                      </Text>
                      {plan.period && (
                        <Text style={styles.planPeriod}>{plan.period}</Text>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.ctaButton,
                      styles.ctaButtonPrestador,
                      plan.recommended && styles.ctaButtonRecommendedPrestador,
                    ]}
                    onPress={() => scrollToSection?.("contacto")}
                  >
                    <Text
                      style={[
                        styles.ctaButtonText,
                        styles.ctaButtonTextPrestador,
                        plan.recommended && styles.ctaButtonTextRecommended,
                      ]}
                    >
                      Consultar plan
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
