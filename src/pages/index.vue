<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
</script>

<template>
  <div class="min-h-screen bg-background text-foreground p-8">
    <div class="max-w-5xl mx-auto space-y-8">
      <div class="space-y-2">
        <h1 class="text-4xl font-bold tracking-tight">
          In-Browser AI Demos
        </h1>
        <p class="text-lg text-muted-foreground">
          Explore the capabilities of local AI running directly in your browser.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Confetti Demo Card -->
        <Card class="flex flex-col transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Sparkles class="h-5 w-5 text-yellow-500" />
              Gesture Confetti
            </CardTitle>
            <CardDescription>
              Recognize hand gestures to trigger visual effects.
            </CardDescription>
          </CardHeader>
          <CardContent class="flex-1">
            <p class="text-sm text-muted-foreground">
              Uses MediaPipe Gesture Recognizer to detect a "Victory" hand sign and launch a confetti celebration.
            </p>
          </CardContent>
          <CardFooter>
            <Button as-child class="w-full">
              <RouterLink to="/confetti">
                Try Demo
              </RouterLink>
            </Button>
          </CardFooter>
        </Card>

        <!-- Placeholder for future demos -->
        <Card class="flex flex-col opacity-60 border-dashed">
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              More AI demos are on the way.
            </CardDescription>
          </CardHeader>
          <CardContent class="flex-1">
            <p class="text-sm text-muted-foreground">
              Stay tuned for Object Detection, Face Landmarks, and LLM integration demos.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" disabled class="w-full">
              Coming Soon
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
