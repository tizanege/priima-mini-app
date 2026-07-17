import { useQuery } from '@tanstack/react-query';
import decodeToken from '../components/utilites';

export function queryStringify(params) {
	const queryString = new URLSearchParams(params).toString();
	return queryString ? `?${queryString}` : '';
}

export async function getVerifications() {
	const { email, baseUrl, queryParams } = decodeToken();
	const response = await fetch(
		`${baseUrl}verification/${queryStringify({
			...queryParams,
		})}`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
	if (!response.ok) {
		throw new Error(response.statusText);
	}
	const data = await response.json();
	if ('form_fields' in data) {
		data.form_fields.basic = {
			first_name: data.form_fields.basic.first_name,
			last_name: data.form_fields.basic.last_name,
			email: {
				id: 'email',
				name: 'Email',
				value: email,
				visibility: 'on',
			},
			...data.form_fields.basic,
		};
	}
	return data;
}

export const useVerification = () => {
	const { baseUrl } = decodeToken();

	return useQuery([`verification-url`, baseUrl], async () => {
		return await getVerifications();
	});
};
