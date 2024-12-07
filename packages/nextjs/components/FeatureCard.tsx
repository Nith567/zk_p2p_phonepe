// components/FeatureCard.tsx
export function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-purple-600 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
