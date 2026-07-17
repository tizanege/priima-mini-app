function decodeToken() {
	const newObject = {
		baseUrl: '',
		email: '',
		queryParams: {
			data: '',
		},
	};
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const data = urlParams.get('data');

	if (data) {
		const parsedData = JSON.parse(atob(data));
		newObject.baseUrl = parsedData.endpoint;
		newObject.email = parsedData.email;
		newObject.queryParams.data = data;
	}

	return newObject;
}

export default decodeToken;
