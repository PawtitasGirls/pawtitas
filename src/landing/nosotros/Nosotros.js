import React from "react";
import { View, Text, Image } from "react-native";
import styles from "./Nosotros.styles";
import avatarMariaToro from "../../../assets/avatar/avatar-maria-toro.jpg";
import avatarMariaElisa from "../../../assets/avatar/avatar-maria.elisa.jpg";
import avatarAndreaPaez from "../../../assets/avatar/avatar-andrea-paez.jpg";

export default function Nosotros() {
  const equipo = [
    {
      nombre: "Andrea Paez",
      descripcion: "Fundadora",
      avatar: avatarAndreaPaez,
    },
    {
      nombre: "María José Toro",
      descripcion: "Fundadora",
      avatar: avatarMariaToro,
    },
    {
      nombre: "María Elisa Zubiri",
      descripcion: "Fundadora",
      avatar: avatarMariaElisa,
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Nosotros</Text>
      <Text style={styles.subtitle}>
        Somos estudiantes de la carrera Analista en Sistemas y amamos a los animales.{"\n"}
        Buscamos brindarte soluciones y ayudarte con tus mascotas
      </Text>

      <View style={styles.missionBox}>
        <Text style={styles.missionTitle}>Nuestra Misión</Text>
        <Text style={styles.missionText}>
          Unimos a dueños de mascotas con prestadores de confianza, facilitando una conexión segura y de calidad para acompañar su bienestar.
        </Text>
      </View>

      <View style={styles.teamRow}>
        {equipo.map((persona, idx) => (
          <View key={idx} style={styles.card}>
            <Image 
              source={persona.avatar} 
              style={styles.avatar}
              resizeMode="cover"
            />
            <Text style={styles.name}>{persona.nombre}</Text>
            <Text style={styles.desc}>{persona.descripcion}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
