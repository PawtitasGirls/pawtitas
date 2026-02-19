import React from "react";
import { View, Text, Switch } from "react-native";
import { PerfilInputField, AvatarPicker } from "../../../../components";
import { styles } from "../editarPerfil.styles";
import { colors } from "../../../../../shared/styles";

const PERFIL_LABELS = {
  Cuidador: "Cuidador",
  Paseador: "Paseador",
  Veterinaria: "Clínica Veterinaria",
  VeterinariaDomicilio: "Veterinario a domicilio",
};

const getPerfilDisplayLabel = (perfil) => {
  if (!perfil?.trim()) return "";
  const first = perfil.split(",")[0]?.trim() || "";
  return PERFIL_LABELS[first] || first;
};

export default function PrestadorServicioPerfilForm({ formData, handleInputChange, errors }) {
  const handleAvailabilityChange = (day, value) => {
    const updatedAvailability = { ...formData.availability, [day]: value };
    handleInputChange("availability", updatedAvailability);
  };

  const handleServiceActiveChange = (value) => {
    handleInputChange("serviceActive", value);
  };

  const handlePetTypeChange = (petType, value) => {
    const updatedPetTypes = { ...formData.petTypes, [petType]: value };
    handleInputChange("petTypes", updatedPetTypes);
    
    // Si se desactiva "otro", limpiar el campo de texto
    if (petType === "otro" && !value) {
      handleInputChange("petTypesCustom", "");
    }
  };

  return (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Personal</Text>
        
        <AvatarPicker
          iconName="person"
          size={64}
          imageUri={formData.avatarUri}
          onImageSelected={(image) => {
            handleInputChange('avatarUri', image.uri);
            handleInputChange('avatarFile', image);
          }}
        />
        
        <PerfilInputField
          label="Nombre y Apellido"
          value={formData.nombreApellido}
          onChangeText={(value) => handleInputChange("nombreApellido", value)}
          placeholder="Ingresa tu nombre completo"
          error={errors.nombreApellido}
          required={true}
        />

        <PerfilInputField
          label="Descripción"
          value={formData.descripcion}
          onChangeText={(value) => handleInputChange("descripcion", value)}
          placeholder="Describe tus servicios y experiencia"
          multiline={true}
          numberOfLines={4}
          maxLength={255}
          error={errors.descripcion}
          required={true}
        />

        <PerfilInputField
          label="Email"
          value={formData.email}
          onChangeText={(value) => handleInputChange("email", value)}
          placeholder="tu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          required={true}
        />

        <PerfilInputField
          label="Número de teléfono"
          value={formData.telefono}
          onChangeText={(value) => handleInputChange("telefono", value)}
          placeholder="11 1234 5678"
          keyboardType="phone-pad"
          error={errors.telefono}
          required={true}
        />

        <PerfilInputField
          label="Ubicación"
          value={formData.ubicacion}
          onChangeText={(value) => handleInputChange("ubicacion", value)}
          placeholder="Dirección o zona de servicio"
          error={errors.ubicacion}
          required={true}
        />
        <Text style={styles.ubicacionHint}>
          Indicá calle, altura y localidad para que podamos ubicarte mejor en el mapa.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Perfil</Text>
        <Text style={styles.perfilRegistradoLabel}>
          {getPerfilDisplayLabel(formData.perfilRegistrado) || "—"}
        </Text>
        <Text style={styles.perfilRegistradoHint}>
          Para modificar tu perfil de servicio, comunicate con el administrador.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipos de mascota</Text>
        {errors.petTypes && (
          <Text style={styles.errorText}>{errors.petTypes}</Text>
        )}
        
        <View style={styles.checkboxGroup}>
          <View style={styles.checkboxItem}>
            <Switch 
              value={formData.petTypes?.perro || false}
              onValueChange={(value) => handlePetTypeChange("perro", value)}
              trackColor={{ false: colors.border.medium, true: "#B77B5D" }}
              thumbColor={colors.surface}
            />
            <Text style={styles.checkboxLabel}>Perro</Text>
          </View>
          
          <View style={styles.checkboxItem}>
            <Switch 
              value={formData.petTypes?.gato || false}
              onValueChange={(value) => handlePetTypeChange("gato", value)}
              trackColor={{ false: colors.border.medium, true: "#B77B5D" }}
              thumbColor={colors.surface}
            />
            <Text style={styles.checkboxLabel}>Gato</Text>
          </View>
          
          <View style={styles.checkboxItem}>
            <Switch 
              value={formData.petTypes?.roedor || false}
              onValueChange={(value) => handlePetTypeChange("roedor", value)}
              trackColor={{ false: colors.border.medium, true: "#B77B5D" }}
              thumbColor={colors.surface}
            />
            <Text style={styles.checkboxLabel}>Roedor</Text>
          </View>
          
          <View style={styles.checkboxItem}>
            <Switch 
              value={formData.petTypes?.otro || false}
              onValueChange={(value) => handlePetTypeChange("otro", value)}
              trackColor={{ false: colors.border.medium, true: "#B77B5D" }}
              thumbColor={colors.surface}
            />
            <Text style={styles.checkboxLabel}>Otro</Text>
          </View>
        </View>

        {formData.petTypes?.otro && (
          <PerfilInputField
            label="Especificar otros tipos de mascota"
            value={formData.petTypesCustom || ""}
            onChangeText={(value) => handleInputChange("petTypesCustom", value)}
            placeholder="Reptiles, peces, etc."
            multiline={false}
            error={errors.petTypesCustom}
            required={true}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Precio y duración</Text>
        
        <PerfilInputField
          label="Precio"
          value={formData.precio}
          onChangeText={(value) => handleInputChange("precio", value)}
          placeholder="$"
          keyboardType="numeric"
          error={errors.precio}
          required={true}
        />

        <PerfilInputField
          label="Duración"
          value={formData.duracion}
          onChangeText={(value) => handleInputChange("duracion", value)}
          placeholder="hh:mm"
          error={errors.duracion}
          required={true}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Disponibilidad</Text>
        {errors.availability && (
          <Text style={styles.errorText}>{errors.availability}</Text>
        )}
        
        <View style={styles.availabilityGroup}>
          <View style={styles.dayItem}>
            <Switch 
              value={formData.availability?.lunes || false}
              onValueChange={(value) => handleAvailabilityChange("lunes", value)}
              trackColor={{ false: colors.border.medium, true: "#B77B5D" }}
              thumbColor={colors.surface}
            />
            <Text style={styles.dayLabel}>Lunes</Text>
          </View>
          
          <View style={styles.dayItem}>
            <Switch 
              value={formData.availability?.martes || false}
              onValueChange={(value) => handleAvailabilityChange("martes", value)}
              trackColor={{ false: colors.border.medium, true: "#B77B5D" }}
              thumbColor={colors.surface}
            />
            <Text style={styles.dayLabel}>Martes</Text>
          </View>
          
          <View style={styles.dayItem}>
            <Switch 
              value={formData.availability?.miercoles || false}
              onValueChange={(value) => handleAvailabilityChange("miercoles", value)}
              trackColor={{ false: colors.border.medium, true: "#B77B5D" }}
              thumbColor={colors.surface}
            />
            <Text style={styles.dayLabel}>Miércoles</Text>
          </View>
          
          <View style={styles.dayItem}>
            <Switch 
              value={formData.availability?.jueves || false}
              onValueChange={(value) => handleAvailabilityChange("jueves", value)}
              trackColor={{ false: colors.border.medium, true: "#B77B5D" }}
              thumbColor={colors.surface}
            />
            <Text style={styles.dayLabel}>Jueves</Text>
          </View>
          
          <View style={styles.dayItem}>
            <Switch 
              value={formData.availability?.viernes || false}
              onValueChange={(value) => handleAvailabilityChange("viernes", value)}
              trackColor={{ false: colors.border.medium, true: "#B77B5D" }}
              thumbColor={colors.surface}
            />
            <Text style={styles.dayLabel}>Viernes</Text>
          </View>
          
          <View style={styles.dayItem}>
            <Switch 
              value={formData.availability?.sabado || false}
              onValueChange={(value) => handleAvailabilityChange("sabado", value)}
              trackColor={{ false: colors.border.medium, true: "#B77B5D" }}
              thumbColor={colors.surface}
            />
            <Text style={styles.dayLabel}>Sábado</Text>
          </View>
          
          <View style={styles.dayItem}>
            <Switch 
              value={formData.availability?.domingo || false}
              onValueChange={(value) => handleAvailabilityChange("domingo", value)}
              trackColor={{ false: colors.border.medium, true: "#B77B5D" }}
              thumbColor={colors.surface}
            />
            <Text style={styles.dayLabel}>Domingo</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado del servicio</Text>
        
        <View style={styles.serviceStatusContainer}>
          <View style={styles.serviceStatusSwitch}>
            <Text style={styles.serviceStatusLabel}>Servicio activo</Text>
            <Switch 
              value={formData.serviceActive || false}
              onValueChange={handleServiceActiveChange}
              trackColor={{ false: colors.border.medium, true: "#B77B5D" }}
              thumbColor={colors.surface}
            />
          </View>
          <Text style={styles.serviceStatusInfo}>
            Los clientes podrán encontrarte y contactarte 
          </Text>
        </View>
      </View>
    </>
  );
}
