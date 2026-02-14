import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { styles } from "./nuevaContrasena.styles";
import LoginInputField from "../../components/inputs/loginInputField";
import LoginBtn from "../../components/buttons/loginBtn";
import { colors } from "../../../shared/styles";
import { actualizarClaveRecuperacion } from "../../services/api/apiRecuperacion";

export default function NuevaContrasenaScreen({ navigation, route }) {
  const { email, codigo } = route?.params || {};
  const [form, setForm] = useState({ nuevaClave: "", confirmar: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({ nuevaClave: false, confirmar: false });

  const validatePassword = (value) => {
    if (!value) return "La contraseña es requerida";
    if (value.length < 6) return "Debe tener al menos 6 caracteres";
    return "";
  };

  const handleSubmit = async () => {
    setTouched({ nuevaClave: true, confirmar: true });
    const errClave = validatePassword(form.nuevaClave);
    if (errClave) {
      setError(errClave);
      return;
    }
    if (form.nuevaClave !== form.confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!email || !codigo) {
      setError("Sesión de recuperación inválida. Volvé a solicitar el código.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await actualizarClaveRecuperacion(email, codigo, form.nuevaClave);
      alert("Contraseña actualizada. Ya podés iniciar sesión.");
      navigation.reset({ index: 0, routes: [{ name: "Inicio" }] });
    } catch (e) {
      setError(e.message || "No se pudo actualizar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => Keyboard.dismiss();

  if (!email || !codigo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Datos de recuperación no encontrados.</Text>
        <TouchableOpacity onPress={() => navigation.navigate("OlvideContrasena")}>
          <Text style={styles.registerLink}>Volver a recuperar contraseña</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      enabled
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Nueva contraseña</Text>
            <Text style={styles.welcomeMessage}>
              Elegí una contraseña nueva e ingresala dos veces para confirmar.
            </Text>

            <View style={styles.inputContainer}>
              <LoginInputField
                label="Nueva contraseña"
                placeholder="Mínimo 6 caracteres"
                value={form.nuevaClave}
                onChangeText={(v) => {
                  setForm((p) => ({ ...p, nuevaClave: v }));
                  setError("");
                }}
                onBlur={() => setTouched((p) => ({ ...p, nuevaClave: true }))}
                secureTextEntry={!showPassword}
                rightComponent={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={18}
                      color={colors.text.secondary}
                    />
                  </TouchableOpacity>
                }
              />
              {touched.nuevaClave && validatePassword(form.nuevaClave) ? (
                <Text style={styles.errorText}>{validatePassword(form.nuevaClave)}</Text>
              ) : (
                <View style={{ height: 20 }} />
              )}
            </View>

            <View style={styles.inputContainer}>
              <LoginInputField
                label="Confirmar contraseña"
                placeholder="Repetí la contraseña"
                value={form.confirmar}
                onChangeText={(v) => {
                  setForm((p) => ({ ...p, confirmar: v }));
                  setError("");
                }}
                onBlur={() => setTouched((p) => ({ ...p, confirmar: true }))}
                secureTextEntry={!showPassword}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <LoginBtn
              label={loading ? "Guardando..." : "Guardar nueva contraseña"}
              onPress={handleSubmit}
            />

            <View style={styles.registerContainer}>
              <TouchableOpacity onPress={() => navigation.navigate("Inicio")}>
                <Text style={styles.registerLink}>Volver al inicio de sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
