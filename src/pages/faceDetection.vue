<script setup lang="ts">
import { ExternalLink } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const DEMO_URL = 'https://mediapipe-studio.webapps.google.com/demo/face_landmarker'
</script>

<template>
  <div class="container mx-auto py-8 px-4 max-w-6xl">
    <div class="flex flex-col gap-6">
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold tracking-tight">
          {{ $t('faceDetection.pageTitle') }}
        </h1>
        <p class="text-muted-foreground">
          {{ $t('faceDetection.subtitle') }}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle class="flex items-center justify-between gap-3 flex-wrap">
            <span>{{ $t('faceDetection.cardTitle') }}</span>
            <Button as-child variant="secondary">
              <a :href="DEMO_URL" target="_blank" rel="noreferrer">
                <ExternalLink class="mr-2 h-4 w-4" />
                {{ $t('faceDetection.openNewTab') }}
              </a>
            </Button>
          </CardTitle>
          <CardDescription>
            {{ $t('faceDetection.permissionHint') }}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div class="w-full rounded-md border bg-card overflow-hidden">
            <div class="relative w-full aspect-video">
              <iframe
                class="absolute inset-0 w-full h-full" :src="DEMO_URL" title="MediaPipe Studio Face Landmarker"
                allow="camera; microphone; fullscreen; clipboard-read; clipboard-write" referrerpolicy="no-referrer"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
