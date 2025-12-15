<script setup lang="ts">
import { Camera, Mic, Sparkles } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const FACE_LANDMARKER_DEMO_URL = 'https://mediapipe-studio.webapps.google.com/demo/face_landmarker'
</script>

<template>
  <div class="min-h-screen bg-background text-foreground p-8">
    <div class="max-w-5xl mx-auto space-y-8">
      <div class="space-y-2">
        <h1 class="text-4xl font-bold tracking-tight">
          {{ $t('app.title') }}
        </h1>
        <p class="text-lg text-muted-foreground">
          {{ $t('app.subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Confetti Demo Card -->
        <Card class="flex flex-col transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Sparkles class="h-5 w-5 text-yellow-500" />
              {{ $t('app.nav.confetti') }}
            </CardTitle>
            <CardDescription>
              {{ $t('app.confetti.desc') }}
            </CardDescription>
          </CardHeader>
          <CardContent class="flex-1">
            <p class="text-sm text-muted-foreground">
              {{ $t('app.confetti.body') }}
            </p>
          </CardContent>
          <CardFooter>
            <Button as-child class="w-full">
              <RouterLink to="/confetti">
                {{ $t('app.nav.try') }}
              </RouterLink>
            </Button>
          </CardFooter>
        </Card>

        <!-- Speech to Text Demo Card -->
        <Card class="flex flex-col transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Mic class="h-5 w-5 text-blue-500" />
              {{ $t('app.nav.speech') }}
            </CardTitle>
            <CardDescription>
              {{ $t('app.speech.desc') }}
            </CardDescription>
          </CardHeader>
          <CardContent class="flex-1">
            <p class="text-sm text-muted-foreground">
              {{ $t('app.speech.body') }}
            </p>
          </CardContent>
          <CardFooter>
            <Button as-child class="w-full">
              <RouterLink to="/speech2Text">
                {{ $t('app.nav.try') }}
              </RouterLink>
            </Button>
          </CardFooter>
        </Card>

        <!-- Face Detection Demo Card -->
        <Card class="flex flex-col transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Camera class="h-5 w-5 text-green-500" />
              {{ $t('app.nav.faceLandmarker') }}
            </CardTitle>
            <CardDescription>
              {{ $t('app.faceLandmarker.desc') }}
            </CardDescription>
          </CardHeader>
          <CardContent class="flex-1">
            <p class="text-sm text-muted-foreground">
              {{ $t('app.faceLandmarker.body') }}
            </p>
          </CardContent>
          <CardFooter>
            <Button as-child class="w-full">
              <a :href="FACE_LANDMARKER_DEMO_URL" target="_blank" rel="noreferrer">
                {{ $t('app.nav.try') }}
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
