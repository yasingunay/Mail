from django.contrib import admin
from .models import User, Email


class UserAdmin(admin.ModelAdmin):
    list_display = ("username", "email")

class UserEmail(admin.ModelAdmin):
    list_display = ("id", "sender", "subject", "body", "timestamp", "read", "archived")
    actions = ['mark_emails_unread']

    def mark_emails_unread(self, request, queryset):
        # Update the selected emails to mark them as unread
        queryset.update(read=False)

    mark_emails_unread.short_description = "Mark selected emails as unread"
    

# Register your models here.
admin.site.register(User, UserAdmin)
admin.site.register(Email, UserEmail)
