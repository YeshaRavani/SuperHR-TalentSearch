/**
 * Utility to map backend opportunity records to the shape expected by the frontend.
 */
window.OpportunityMapper = {
    /**
     * Maps a backend opportunity object to the frontend structure.
     * @param {Object} opp - The opportunity object from the API.
     * @returns {Object} - Normalized opportunity object.
     */
    map: function (backendOpp) {
        if (!backendOpp) return null;

        // Determine link based on type
        const typeLc = (backendOpp.type || 'event').toLowerCase();
        const detailPage = typeLc === 'initiative' ? 'initiative-detail.html' : 
                           (typeLc === 'workshop' ? 'workshop-detail.html' : 'event-detail.html');

        return {
            id: backendOpp.id,
            category: backendOpp.type, // UI expects 'category'
            title: backendOpp.title,
            description: backendOpp.short_description, // UI expects 'description'
            fullDescription: backendOpp.full_description,
            dateStr: backendOpp.schedule_time, // UI expects 'dateStr'
            points: backendOpp.points_reward, // UI expects 'points'
            timeRequired: backendOpp.time_required,
            location: backendOpp.location,
            link: `${detailPage}?id=${backendOpp.id}`,
            
            // Rich UI fields from backend
            tagIcon: backendOpp.tag_icon || '<circle cx="12" cy="12" r="10"></circle>',
            bgGradient: backendOpp.bg_gradient || 'linear-gradient(140deg, #f3f4f6, #e5e7eb)',
            iconColor: backendOpp.icon_color || '#9ca3af',
            mainIcon: backendOpp.main_icon || '<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
            
            // Arrays (backend returns them as arrays now due to Pydantic field_validator)
            skills: backendOpp.skills || [],
            expectations: backendOpp.expectations || [],
            responsibilities: backendOpp.responsibilities || [],
            benefits: backendOpp.benefits || [],
            prerequisites: backendOpp.prerequisites || [],
            
            status: backendOpp.status,
            authorId: backendOpp.author_id,
            appliedCount: backendOpp.appliedCount || 0 // Backend might need to provide this later
        };
    }
};
