<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Leaf } from 'lucide-vue-next'

const router = useRouter()
const auth = useAuthStore()
const headline = ref(null)
const sub = ref(null)
const cta = ref(null)
const parallaxRef = ref(null)

function handleScroll() {
  if (parallaxRef.value) {
    const y = window.scrollY
    parallaxRef.value.style.transform = `translateY(${y * 0.2}px)`
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  import('gsap').then(({ default: gsap }) => {
    if (headline.value) gsap.fromTo(headline.value, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out', delay: 0.2 })
    if (sub.value) gsap.fromTo(sub.value, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', delay: 0.45 })
    if (cta.value) gsap.fromTo(cta.value, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.65 })
  }).catch(() => {})
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function handleCta() {
  if (auth.isLoggedIn) {
    router.push('/plants')
  } else {
    router.push('/login?redirect=/plants')
  }
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden">
    <!-- Parallax forest background -->
    <div
      ref="parallaxRef"
      class="parallax-layer absolute inset-0 rounded-b-3xl"
      style="background: linear-gradient(180deg, var(--color-forest) 0%, #2a5f47 50%, #244d3d 100%);"
    >
      <!-- Subtle tree silhouettes -->
      <div class="absolute inset-0 opacity-20">
        <div class="absolute bottom-0 left-0 h-2/3 w-1/4 rounded-t-full bg-[#1E2A24]" style="transform: scaleX(1.2);" />
        <div class="absolute bottom-0 right-1/4 h-1/2 w-1/5 rounded-t-full bg-[#1E2A24]" />
        <div class="absolute bottom-0 right-0 h-3/4 w-1/3 rounded-t-full bg-[#1E2A24]" style="transform: scaleX(1.1);" />
      </div>
      <!-- Soft sunlight overlay -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-15%,rgba(255,248,220,0.18),transparent_55%)]" />
    </div>

    <!-- Floating leaf particles -->
    <div class="pointer-events-none absolute inset-0 overflow-hidden rounded-b-3xl">
      <Leaf
        v-for="i in 10"
        :key="i"
        class="leaf-float absolute text-white/30"
        :style="{
          left: `${8 + (i * 9) % 85}%`,
          top: `${15 + (i * 7) % 70}%`,
          width: `${0.75 + (i % 3) * 0.35}rem`,
          height: `${0.75 + (i % 3) * 0.35}rem`,
          animationDelay: `${i * 0.6}s`,
        }"
        stroke-width="1.5"
      />
    </div>

    <!-- Hero content -->
    <section class="relative flex min-h-[90vh] flex-col items-center justify-center px-6 pt-20 pb-24 text-center text-white">
      <h1 ref="headline" class="font-serif text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
        Grow Nature at Home
      </h1>
      <p ref="sub" class="mt-6 max-w-xl text-lg opacity-95 sm:text-xl">
        Sustainable, eco-friendly plants for every space. Calm, organic, and kind to the planet.
      </p>
      <div ref="cta" class="mt-10">
        <button
          type="button"
          class="btn-primary inline-flex items-center justify-center gap-2 px-10 py-4 text-base"
          style="color: white;"
          @click="handleCta"
        >
          <Leaf class="h-5 w-5 shrink-0" stroke-width="1.5" />
          Explore Our Plants
        </button>
      </div>
    </section>

    <!-- Story section with brown accent -->
    <section class="relative mx-auto max-w-4xl px-6 py-20 text-center">
      <h2 class="font-serif text-3xl font-semibold sm:text-4xl" style="color: var(--color-text-dark);">
        Our Story
      </h2>
      <p class="mt-6 leading-relaxed" style="color: var(--color-text-dark); opacity: 0.85;">
        We believe in sustainability and the quiet power of nature. Every plant is chosen to thrive with care—bringing calm and eco-friendly beauty into your home.
      </p>
      <p class="mt-4 text-sm" style="color: var(--color-soil);">
        Green gradients, brown accents, and water blue highlights—a calm forest atmosphere.
      </p>
    </section>
  </div>
</template>
