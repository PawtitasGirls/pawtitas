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
  ActivityIndicator,
} from "react-native";
import { styles } from "./olvideContrasena.styles";
import LoginInputField from "../../components/inputs/loginInputField";
import LoginBtn from "../../components/buttons/loginBtn";
import {
  solicitarCodigoRecuperacion,
  verificarCodigoRecuperacion,
} from "../../services/api/apiRecuperacion";

const STEP_EMAIL = "email";
const STEP_CODIGO = "codigo";

export default function OlvideContrasenaScreen({ navigation }) {
  const [step, setStep] = useState(STEP_EMAIL);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({ email: false, codigo: false });

  const validateEmail = (value) => {
    if (!value?.trim()) return "El email es requerido";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Ingresá un email válido";
    return "";
  };

  const handleSolicitarCodigo = async () => {
    if (loading) return;
    setTouched((p) => ({ ...p, email: true }));
    const err = validateEmail(email);
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await solicitarCodigoRecuperacion(email.trim());
      setStep(STEP_CODIGO);
      setCodigo("");
      setTouched({ email: true, codigo: false });
    } catch (e) {
      setError(e.message || "No se pudo enviar el código");
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async () => {
    if (loading) return;
    setTouched((p) => ({ ...p, codigo: true }));
    if (!codigo?.trim()) {
      setError("Ingresá el código que recibiste por email");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await verificarCodigoRecuperacion(email.trim(), codigo.trim());
      navigation.replace("NuevaContrasena", { email: email.trim(), codigo: codigo.trim() });
    } catch (e) {
      setError(e.message || "Código incorrecto");
    } finally {
      setLoading(false);
    }
  };

  const dismissKeyboard = () => Keyboard.dismiss();

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      enabled
    >
      <TouchableWithoutFeedback onPress={dismissKeyboard}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {step === STEP_EMAIL ? "Recuperar contraseña" : "Ingresá el código"}
            </Text>
            <Text style={styles.welcomeMessage}>
              {step === STEP_EMAIL
                ? "Ingresá tu email y te enviamos un código para recuperar tu contraseña."
                : "Revisá tu casilla de correo e ingresá el código de 6 dígitos."}
            </Text>

            {step === STEP_EMAIL ? (
              <>
                <View style={styles.inputContainer}>
                  <LoginInputField
                    label="Email"
                    placeholder="tu@email.com"
                    value={email}
                    onChangeText={(v) => {
                      setEmail(v);
                      setError("");
                    }}
                    onBlur={() => setTouched((p) => ({ ...p, email: true }))}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                  />
                  {touched.email && validateEmail(email) ? (
                    <Text style={styles.errorText}>{validateEmail(email)}</Text>
                  ) : (
                    <View style={{ height: 20 }} />
                  )}
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <LoginBtn
                  label={loading ? "Enviando..." : "Enviar código"}
                  onPress={handleSolicitarCodigo}
                  disabled={loading}
                />
              </>
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <LoginInputField
                    label="Código"
                    placeholder="123456"
                    value={codigo}
                    onChangeText={(v) => {
                      setCodigo(v.replace(/\D/g, "").slice(0, 6));
                      setError("");
                    }}
                    onBlur={() => setTouched((p) => ({ ...p, codigo: true }))}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                {loading ? (
                  <ActivityIndicator size="small" color="#f5a3c1" style={{ marginVertical: 16 }} />
                ) : (
                  <LoginBtn label="Confirmar código" onPress={handleVerificarCodigo} />
                )}
                <TouchableOpacity
                  style={styles.backLink}
                  onPress={() => {
                    setStep(STEP_EMAIL);
                    setError("");
                  }}
                >
                  <Text style={styles.backLinkText}>Volver a ingresar email</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.registerContainer}>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.registerLink}>Volver al inicio de sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
