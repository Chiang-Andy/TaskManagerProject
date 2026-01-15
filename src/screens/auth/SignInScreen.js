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
import { useSignIn, useOAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Input, Button } from '../../components';
import { Colors } from '../../constants/colors';

WebBrowser.maybeCompleteAuthSession();

const SignInScreen = ({ navigation }) => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow: googleOAuth } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: appleOAuth } = useOAuth({ strategy: 'oauth_apple' });

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);

  // Email OTP sign in
  const handleEmailSignIn = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const { supportedFirstFactors } = await signIn.create({
        identifier: email,
      });

      const emailCodeFactor = supportedFirstFactors?.find(
        (factor) => factor.strategy === 'email_code'
      );

      if (emailCodeFactor) {
        await signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: emailCodeFactor.emailAddressId,
        });
        setPendingVerification(true);
      }
    } catch (error) {
      Alert.alert('Error', error.errors?.[0]?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Verify email code
  const handleVerifyCode = async () => {
    if (!isLoaded) return;
    setLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code,
      });

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
  const handleGoogleSignIn = useCallback(async () => {
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

  const handleAppleSignIn = useCallback(async () => {
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
          <Text style={styles.title}>Check your email</Text>
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

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => setPendingVerification(false)}
          >
            <Text style={styles.linkText}>Use a different email</Text>
          </TouchableOpacity>
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

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
            onPress={handleEmailSignIn}
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
            onPress={handleGoogleSignIn}
          />

          {Platform.OS === 'ios' && (
            <View style={styles.buttonSpacer}>
              <Button
                title="Continue with Apple"
                variant="secondary"
                onPress={handleAppleSignIn}
              />
            </View>
          )}

          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpLink}>Sign up</Text>
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
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signUpText: {
    color: Colors.textSecondary,
  },
  signUpLink: {
    color: Colors.primary,
    fontWeight: '600',
  },
  backLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    color: Colors.primary,
  },
});

export default SignInScreen;
