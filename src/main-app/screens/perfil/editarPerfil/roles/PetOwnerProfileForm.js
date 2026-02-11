import React from "react";
import { View, Text } from "react-native";
import { PerfilInputField, AvatarPicker } from "../../../../components";
import { styles } from "../editarPerfil.styles";

// Componente de formulario específico para el rol de dueño de mascota
export default function PetOwnerProfileForm({ formData, handleInputChange, errors }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Información Personal</Text>
      
      <AvatarPicker
        iconName="person"
        size={64}
        imageUri={formData.avatarUri}
        onImageSelected={(image) => handleInputChange('avatarUri', image.uri)}
      />
      
      <PerfilInputField
        label="Nombre y Apellido"
        value={formData.nombreApellido}
        onChangeText={(value) => handleInputChange("nombreApellido", value)}
        placeholder="Ingresa tu nombre completo"
        error={errors.nombreApellido}
      />

      <PerfilInputField
        label="Descripción"
        value={formData.descripcion}
        onChangeText={(value) => handleInputChange("descripcion", value)}
        placeholder="Cuéntanos sobre ti y tus mascotas"
        multiline={true}
        numberOfLines={4}
        maxLength={255}
        error={errors.descripcion}
      />

      <PerfilInputField
        label="Email"
        value={formData.email}
        onChangeText={(value) => handleInputChange("email", value)}
        placeholder="tu@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <PerfilInputField
        label="Número de teléfono"
        value={formData.telefono}
        onChangeText={(value) => handleInputChange("telefono", value)}
        placeholder="11 1234 5678"
        keyboardType="phone-pad"
        error={errors.telefono}
      />

      <PerfilInputField
        label="Ubicación"
        value={formData.ubicacion}
        onChangeText={(value) => handleInputChange("ubicacion", value)}
        placeholder="Tu dirección o zona"
        error={errors.ubicacion}
      />
      <Text style={styles.ubicacionHint}>
        Indicá calle, altura y localidad para que podamos ubicarte mejor en el mapa.
      </Text>
    </View>
  );
}
