// custom script for encrypting and decrypting in the browser
import {
	KmsKeyringBrowser,
	KMS,
	getClient,
	encrypt,
	decrypt
} from '@aws-crypto/client-browser'
import { toBase64 } from '@aws-sdk/util-base64-browser'

declare const credentials: {accessKeyId: string, secretAccessKey: string, sessionToken: string}

export async function encryptKMS(plainText) {
	const generatorKeyId = 'arn:aws:kms:us-west-2:658956600833:alias/EncryptDecrypt'

	const keyIds = ['arn:aws:kms:us-west-2:658956600833:key/b3537ef1-d8dc-4780-9f5a-55776cbb2f7f']

	const { accessKeyId, secretAccessKey, sessionToken } = credentials

	const clientProvider = getClient(KMS, {
		credentials: {
			accessKeyId,
			secretAccessKey,
			sessionToken
		}
	})

	const keyring = new KmsKeyringBrowser({clientProvider, generatorKeyId, keyIds})

	const {result} = await encrypt(keyring, plainText)
	console.log('plainText: ', plainText)
	console.log('\nencrypted: ', result)

	return {result}
}

export async function decryptKMS(cipherText) {
	const generatorKeyId = 'arn:aws:kms:us-west-2:658956600833:alias/EncryptDecrypt'

	const keyIds = ['arn:aws:kms:us-west-2:658956600833:key/b3537ef1-d8dc-4780-9f5a-55776cbb2f7f']

	const { accessKeyId, secretAccessKey, sessionToken } = credentials

	const clientProvider = getClient(KMS, {
		credentials: {
			accessKeyId,
			secretAccessKey,
			sessionToken
		}
	})

	const keyring = new KmsKeyringBrowser({clientProvider, generatorKeyId, keyIds})

	const { plainText, messageHeader } = await decrypt(keyring, cipherText)
	console.log('cipherText: ', cipherText)
	console.log('\ndecrypted: ', plainText)

	return {plainText}
}