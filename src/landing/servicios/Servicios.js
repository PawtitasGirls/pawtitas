import React from "react";
import { View, Text } from "react-native";
import styles from "./Servicios.styles";

const services = [
  { 
    title: "Cuidadores", 
    icon: "🏠",
    description: "Cuida tu mascota cuando no estás" 
  },
  { 
    title: "Paseadores", 
    icon: "🦮",
    description: "Paseos diarios para tu mejor amigo" 
  },
  { 
    title: "Emergencias", 
    icon: "🚑",
    description: "Atención veterinaria" 
  },
  { 
    title: "Veterinarios", 
    icon: "🐾",
    description: "Consultas y chequeos regulares" 
  },
];

export default function Servicios() {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Servicios disponibles</Text>
      <Text style={styles.subtitle}>
        Contamos con todas las opciones para el cuidado de tu mascota.  
        {"\n\n"}
        ¿Te vas de viaje y necesitas cuidador? ¿Buscás paseador? ¿Necesitás veterinaria cercana o a domicilio? ¿Tenés una emergencia?
        {"\n\n"}
        Todo y más lo podés encontrar acá.
      </Text>

      <View style={styles.cardContainer}>
        {services.map((service, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.icon}>{service.icon}</Text>
            <Text style={styles.cardTitle}>{service.title}</Text>
            <Text style={styles.cardDescription}>{service.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
