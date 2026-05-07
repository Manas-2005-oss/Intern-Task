export function normalizeCollege(college = {}) {
  return {
    id: college.id ?? college._id ?? college.slug,
    name: college.name ?? 'Unnamed college',
    location: college.location ?? college.city ?? 'Location unavailable',
    state: college.state ?? '',
    rating: college.rating ?? college.averageRating ?? null,
    fees: college.fees ?? college.averageFees ?? null,
    placementRate: college.placementRate ?? college.placement_percentage ?? null,
    courses: college.courses ?? [],
    image: college.image ?? college.coverImage ?? '',
    type: college.type ?? 'College',
    overview: college.overview ?? college.description ?? '',
    reviews: college.reviews ?? [],
    accreditation: college.accreditation ?? '',
  };
}
