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
  "Sin suscripción",
  "Registrate gratis",
  "Pagás solo por cada reserva que hagas",
];

export default function Suscripciones({ scrollToSection }) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Suscripciones</Text>
        <Text style={styles.subtitle}>
          Planes para prestadores de servicios. Si sos dueño de mascota, accedé
          gratis y pagá solo cuando uses un servicio.
        </Text>
      </View>

      <View style={styles.plansWrapper}>
        {/* Tarjeta informativa para dueños */}
        <View style={styles.duenioInfoSection}>
          <View style={styles.duenioInfoCard}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>🐾</Text>
              <Text style={styles.categoryTitle}>¿Sos dueño de mascotas?</Text>
            </View>
            <Text style={styles.duenioInfoSubtitle}>
              Accedé gratis. Pagá solo una comisión cuando uses un servicio.
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
              <Text style={styles.duenioCtaText}>Registrarme gratis</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryIcon}>💼</Text>
            <Text style={styles.categoryTitle}>¿Sos prestador de servicios?</Text>
          </View>

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
  );
}
