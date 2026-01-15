import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSignUp, useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Input, Button } from '../../components';
import { Colors } from '../../constants/colors';

WebBrowser.maybeCompleteAuthSession();

const SignUpScreen = ({ navigation }) => {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startOAuthFlow: googleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: appleOAuth } = useOAuth({ strategy: 'oauth_apple' });

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailSignUp = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      await signUp.create({
        emailAddress: email,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (error) {
      Alert.alert('Error', error.errors?.[0]?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
      }
    } catch (error) {
      Alert.alert('Error', error.errors?.[0]?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  // OAuth handlers
  const handleGoogleSignUp = useCallback(async () => {
    try {
      const { createdSessionId, setActive: setActiveSession } = await googleOAuth({
        redirectUrl: Linking.createURL('/oauth-callback'),
      });

      if (createdSessionId) {
        await setActiveSession({ session: createdSessionId });
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
    }
  }, [googleOAuth]);

  const handleAppleSignUp = useCallback(async () => {
    try {
      const { createdSessionId, setActive: setActiveSession } = await appleOAuth({
        redirectUrl: Linking.createURL('/oauth-callback'),
      });

      if (createdSessionId) {
        await setActiveSession({ session: createdSessionId });
      }
    } catch (error) {
      console.error('Apple OAuth error:', error);
    }
  }, [appleOAuth]);

  if (pendingVerification) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Verify your email</Text>
          <Text style={styles.subtitle}>
            We sent a verification code to {email}
          </Text>

          <Input
            label="Verification Code"
            value={code}
            onChangeText={setCode}
            placeholder="Enter code"
            keyboardType="number-pad"
          />

          <Button
            title={loading ? 'Verifying...' : 'Verify'}
            onPress={handleVerifyCode}
            disabled={loading || !code}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started</Text>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Button
            title={loading ? 'Sending...' : 'Continue with Email'}
            onPress={handleEmailSignUp}
            disabled={loading || !email}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Continue with Google"
            variant="secondary"
            onPress={handleGoogleSignUp}
          />

          {Platform.OS === 'ios' && (
            <View style={styles.buttonSpacer}>
              <Button
                title="Continue with Apple"
                variant="secondary"
                onPress={handleAppleSignUp}
              />
            </View>
          )}

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.textSecondary,
  },
  buttonSpacer: {
    marginTop: 12,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signInText: {
    color: Colors.textSecondary,
  },
  signInLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

export default SignUpScreen;
