<template>
  <UModal v-model:open="isOpen">
    <template #content>
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-medium">Settings</h2>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="isOpen = false"
          />
        </div>

        <div class="space-y-6">
          <!-- theme -->
          <div>
            <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">
              Theme
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="option in themeOptions"
                :key="option.value"
                class="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all"
                :class="
                  colorMode.preference === option.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                "
                @click="colorMode.preference = option.value"
              >
                <UIcon :name="option.icon" class="text-xl" />
                <span class="text-xs font-medium">{{ option.label }}</span>
              </button>
            </div>
          </div>

          <!-- accent color -->
          <div>
            <label class="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">
              Accent Color
            </label>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="color in accentColors"
                :key="color.name"
                class="w-8 h-8 rounded-full transition-transform hover:scale-110 ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900"
                :class="[
                  color.class,
                  selectedAccent === color.name ? 'ring-neutral-900 dark:ring-white' : 'ring-transparent'
                ]"
                :title="color.name"
                @click="setAccentColor(color.name)"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const isOpen = defineModel<boolean>({ default: false });
const colorMode = useColorMode();

const themeOptions = [
  { value: "light", label: "Light", icon: "i-lucide-sun" },
  { value: "dark", label: "Dark", icon: "i-lucide-moon" },
  { value: "system", label: "System", icon: "i-lucide-monitor" },
];

const accentColors = [
  { name: "green", class: "bg-green-500" },
  { name: "blue", class: "bg-blue-500" },
  { name: "violet", class: "bg-violet-500" },
  { name: "rose", class: "bg-rose-500" },
  { name: "orange", class: "bg-orange-500" },
  { name: "cyan", class: "bg-cyan-500" },
];

const selectedAccent = useState("accentColor", () => "green");

function setAccentColor(color: string) {
  selectedAccent.value = color;
}
</script>
