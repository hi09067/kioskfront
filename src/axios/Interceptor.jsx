import axios from "axios";
import Swal from "sweetalert2";

// 외부 컴포넌트에서 서버 요청 시 사용할 axios 인스턴스 생성 함수
export default function createInstance() {
	const instance = axios.create();
	return setInterceptors(instance);
}

// axios 인스턴스에 인터셉터 설정 (요청/응답 가로채기)
function setInterceptors(instance) {

/*
    // 요청 인터셉터: 클라이언트 → 서버 요청 시 요청 객체를 가로채어 처리
    instance.interceptors.request.use(
        function(config) { // 요청이 정상적으로 구성된 경우
		   //스토리지에 저장된 accessToken 추출.
		   const accessToken = useUserStore.getState().accessToken; //인터셉터는 컴포넌트가 아니므로, 추출하는 코드 상이.

		   //스토리지에 저장된 accessToken 요청 헤더에 포함시키기.
		   if(accessToken != null){
				config.headers['Authorization'] = accessToken;
		   }


           return config;
		},
		function(error) { // 요청 구성 중 오류가 발생한 경우
			return Promise.reject(error);
		},
	);
    */
    
    // 응답 인터셉터: 서버 → 클라이언트 응답 시 응답 객체를 가로채어 처리
	instance.interceptors.response.use(
        
		function(response) { // 서버 응답이 정상적으로 도착한 경우       
			
			//서버에서 HttpStatus.OK로 응답된 경우 && 알림창에 띄워줄 메시지 응답한 경우
			if(response.data.clientMsg != undefined && response.data.clientMsg != ''){
				Swal.fire({
					title : '알림',
					text : response.data.clientMsg,
					icon : response.data.alertIcon
				});
			}
			return response;
		},
		function(error) {   // 응답 처리 중 오류가 발생한 경우 (ResponseDTO.HttpStatus: 4xx, 5xx)

			const originalRequest = error.config; // 기존 요청 정보를 담고 있는 객체
			
			if(error.status == 500) { // HttpStatus.INTERNAL_SERVER_ERROR == 500 (서버 오류)
				const res = error.response.data; //백엔드에서 응답해준 ResponseDTO 객체
				Swal.fire({
					title : "알림",
					text : res.clientMsg,
					icon : res.alertIcon
				});
			}

			return Promise.reject(error);
		},
	);

	return instance;
}