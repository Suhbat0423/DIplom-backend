VUS=10 DURATION=30s k6 run load-tests/orders.k6.js

         /\      Grafana   /‾‾/
    /\  /  \     |\  __   /  /

/ \/ \ | |/ / / ‾‾\
/ \ | ( | (‾) |
/ \***\*\_\_\*\*** \ |\_|\_\ \_\_\_\_\_/

     execution: local
        script: load-tests/orders.k6.js
        output: -

     scenarios: (100.00%) 1 scenario, 10 max VUs, 1m0s max duration (incl. graceful stop):
              * default: 10 looping VUs for 30s (gracefulStop: 30s)

█ THRESHOLDS

    http_req_duration
    ✓ 'p(95)<1500' p(95)=36.13ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%

█ TOTAL RESULTS

    checks_total.......: 602     19.623515/s
    checks_succeeded...: 100.00% 602 out of 602
    checks_failed......: 0.00%   0 out of 602

    ✓ login status is 200
    ✓ login returned token
    ✓ order create status is 201
    ✓ order create returned id

    HTTP
    http_req_duration..............: avg=18.25ms min=3.69ms med=15.68ms max=89.13ms p(90)=28.92ms p(95)=36.13ms
      { expected_response:true }...: avg=18.25ms min=3.69ms med=15.68ms max=89.13ms p(90)=28.92ms p(95)=36.13ms
    http_req_failed................: 0.00%  0 out of 301
    http_reqs......................: 301    9.811757/s

    EXECUTION
    iteration_duration.............: avg=1.01s   min=1s     med=1.01s   max=1.07s   p(90)=1.03s   p(95)=1.03s
    iterations.....................: 300    9.77916/s
    vus............................: 10     min=10       max=10
    vus_max........................: 10     min=10       max=10

    NETWORK
    data_received..................: 504 kB 16 kB/s
    data_sent......................: 230 kB 7.5 kB/s

÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷
÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷
÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷÷

VUS=10 DURATION=30s k6 run load-tests/payments.k6.js

         /\      Grafana   /‾‾/
    /\  /  \     |\  __   /  /

/ \/ \ | |/ / / ‾‾\
/ \ | ( | (‾) |
/ \***\*\_\_\*\*** \ |\_|\_\ \_\_\_\_\_/

     execution: local
        script: load-tests/payments.k6.js
        output: -

     scenarios: (100.00%) 1 scenario, 10 max VUs, 1m0s max duration (incl. graceful stop):
              * default: 10 looping VUs for 30s (gracefulStop: 30s)

█ THRESHOLDS

    http_req_duration
    ✓ 'p(95)<2000' p(95)=32.15ms

    http_req_failed
    ✓ 'rate<0.05' rate=0.00%

█ TOTAL RESULTS

    checks_total.......: 1452    46.83339/s
    checks_succeeded...: 100.00% 1452 out of 1452
    checks_failed......: 0.00%   0 out of 1452

    ✓ login status is 200
    ✓ login returned token
    ✓ order pre-step status is 201
    ✓ payment create status is 201 or 200
    ✓ payment create returned id
    ✓ payment confirm status is 200
    ✓ payment confirm status is paid

    HTTP
    http_req_duration..............: avg=21.49ms min=4.78ms med=19.96ms max=147.88ms p(90)=27.65ms p(95)=32.15ms
      { expected_response:true }...: avg=21.49ms min=4.78ms med=19.96ms max=147.88ms p(90)=27.65ms p(95)=32.15ms
    http_req_failed................: 0.00%  0 out of 871
    http_reqs......................: 871    28.093583/s

    EXECUTION
    iteration_duration.............: avg=1.06s   min=1.03s  med=1.06s   max=1.18s    p(90)=1.07s   p(95)=1.07s
    iterations.....................: 290    9.353776/s
    vus............................: 4      min=4        max=10
    vus_max........................: 10     min=10       max=10

    NETWORK
    data_received..................: 1.3 MB 41 kB/s
    data_sent......................: 533 kB 17 kB/s

үүүүүү

STAGE_1_TARGET=20 STAGE_2_TARGET=50 STAGE_3_TARGET=100 STAGE_4_TARGET=150 \
 k6 run load-tests/orders-stress.k6.js

38000 дээр алдаа гарлаа

WARN[0046] Request Failed error="Post \"http://localhost:8080/api/orders\": dial tcp 127.0.0.1:8080: connect: can't assign requested address"
WARN[0046] Request Failed error="Post \"http://localhost:8080/api/orders\": dial tcp 127.0.0.1:8080: connect: can't assign requested address"
WARN[0046] Request Failed error="Post \"http://localhost:8080/api/orders\": dial tcp 127.0.0.1:8080: connect: can't assign requested address"
WARN[0046] Request Failed error="Post \"http://localhost:8080/api/orders\": dial tcp 127.0.0.1:8080: connect: can't assign requested address"
WARN[0046] Request Failed error="Post \"http://localhost:8080/api/orders\": dial tcp 127.0.0.1:8080: connect: can't assign requested address"

тэст

dial tcp 127.0.0.1:8080: connect: can't assign requested address

Энэ нь их магадлалаар:

- backend logic унасан алдаа биш
- MongoDB query алдаа биш
- k6 ажиллаж байгаа локал машин дээрх socket/address exhaustion

Тэгэхээр диплом дээр ингэж бичвэл зөв:

- “Өндөр ачааллын үед stress test-ийн явцад client-side connection exhaustion ажиглагдсан.”
- “Local single-node орчинд request rate өсөхөд load generator өөрөө network resource limit-д хүрсэн.”
- “Иймээс энэ тест нь зөвхөн application биш, туршилтын орчны хязгаарлалтыг мөн харуулсан.”
