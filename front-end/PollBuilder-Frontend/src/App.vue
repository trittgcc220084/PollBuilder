<template>
  <!--
    App.vue chỉ nên đóng vai trò "khung" của toàn app.
    router-view chính là chỗ Vue Router sẽ bơm component
    tương ứng với route hiện tại vào (CreatePoll, VotePoll, ResultsPoll...).

    Trước đây App.vue hard-code thẳng giao diện Poll Builder,
    nên dù URL đổi thế nào, nội dung hiển thị luôn là form tạo poll
    -> đó là lý do bấm link vote luôn "quay lại" màn hình ban đầu.
  -->
  <router-view />
</template>

<script setup>
</script>