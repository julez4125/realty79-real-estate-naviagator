<template>
  <div class="auth-layout min-h-screen flex">
    <!-- Left branding panel (hidden on mobile) -->
    <div class="hidden lg:flex w-[35vw] bg-primary items-center justify-center">
      <div class="text-center text-white">
        <h1 class="text-4xl font-bold mb-4">Realty79</h1>
        <p class="text-lg opacity-80">Die smarte Plattform fur Immobilien-Investoren</p>
      </div>
    </div>

    <!-- Right form panel -->
    <div class="flex-1 flex items-center justify-center bg-backgroundPrimary p-6">
      <div class="w-full max-w-[420px]">
        <div class="lg:hidden text-center mb-8">
          <h1 class="text-2xl font-bold text-primary">Realty79</h1>
        </div>
        <RouterView />
      </div>
    </div>
  </div>
</template>
