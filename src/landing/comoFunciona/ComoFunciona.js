import React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import styles from "./ComoFunciona.styles";

const steps = [
  { number: "1", title: "Descarga la App", description: "Disponible en Play Store" },
  { number: "2", title: "Busca el servicio", description: "Encuentra lo que necesitas" },
  { number: "3", title: "Conecta", description: "Habla con el prestador" },
  { number: "4", title: "Disfruta", description: "Tu mascota en buenas manos" }
];

export default function ComoFunciona() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>¿Cómo funciona?</Text>
      <Text style={styles.subtitle}>
        En 4 simples pasos podés comenzar a disfrutar de nuestros servicios.
      </Text>

      <View style={[styles.stepsContainer, isMobile && styles.stepsContainerMobile]}>
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <View style={[styles.stepCard, isMobile && styles.stepCardMobile]}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.number}</Text>
              </View>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>
            </View>
            {idx < steps.length - 1 && (
              <Text style={[styles.stepArrow, isMobile && styles.stepArrowMobile]}>
                {isMobile ? "↓" : "→"}
              </Text>
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

