import dash
from dash import dcc, html, dash_table
from dash.dependencies import Input, Output
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import json
import os
from datetime import datetime

# Initialize the Dash app
app = dash.Dash(__name__, title="Instagram Data Dashboard")

# Load the data
def load_data():
    try:
        with open("parsed_instagram_posts.json", "r") as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        return []

# Function to convert data to DataFrame
def create_dataframes(data):
    # Main posts dataframe
    posts_df = pd.DataFrame([
        {
            'id': post.get('id'),
            'type': post.get('type'),
            'caption': post.get('caption'),
            'url': post.get('url'),
            'timestamp': post.get('timestamp'),
            'likes': post.get('likes', 0),
            'comments': post.get('comments', 0),
            'hashtag_count': len(post.get('hashtags', [])),
            'mention_count': len(post.get('mentions', [])),
            'tagged_users_count': len(post.get('tagged_users', [])),
            'has_music': 1 if post.get('music') else 0,
            'owner': post.get('owner', {}).get('username')
        } for post in data
    ])
    
    # Convert timestamp to datetime
    if 'timestamp' in posts_df.columns:
        posts_df['timestamp'] = pd.to_datetime(posts_df['timestamp'])
        posts_df['date'] = posts_df['timestamp'].dt.date
    
    return posts_df

# App layout
app.layout = html.Div([
    html.H1("Instagram Data Dashboard", style={'textAlign': 'center', 'marginBottom': 30}),
    
    html.Div([
        html.Button('Refresh Data', id='refresh-button', 
                   style={'marginBottom': 20, 'backgroundColor': '#4CAF50', 'color': 'white', 'border': 'none', 'padding': '10px 20px'}),
        html.Div(id='last-updated', style={'marginBottom': 20, 'fontStyle': 'italic'})
    ], style={'textAlign': 'center'}),
    
    html.Div([
        html.Div([
            html.H3("Post Engagement Overview"),
            dcc.Graph(id='engagement-chart')
        ], className='card', style={'width': '48%', 'display': 'inline-block', 'padding': '20px', 'boxShadow': '0 4px 8px 0 rgba(0,0,0,0.2)'}),
        
        html.Div([
            html.H3("Post Types Distribution"),
            dcc.Graph(id='post-types-pie')
        ], className='card', style={'width': '48%', 'display': 'inline-block', 'padding': '20px', 'boxShadow': '0 4px 8px 0 rgba(0,0,0,0.2)'}),
    ], style={'display': 'flex', 'justifyContent': 'space-between', 'marginBottom': '20px'}),
    
    html.Div([
        html.H3("Posts Timeline"),
        dcc.Graph(id='timeline-chart')
    ], className='card', style={'padding': '20px', 'boxShadow': '0 4px 8px 0 rgba(0,0,0,0.2)', 'marginBottom': '20px'}),
    
    html.Div([
        html.H3("Posts Data Table"),
        dash_table.DataTable(
            id='posts-table',
            style_table={'overflowX': 'auto'},
            style_cell={
                'height': 'auto',
                'minWidth': '100px', 'width': '150px', 'maxWidth': '300px',
                'whiteSpace': 'normal',
                'textAlign': 'left'
            },
            style_header={
                'backgroundColor': 'rgb(230, 230, 230)',
                'fontWeight': 'bold'
            },
            style_data_conditional=[
                {
                    'if': {'row_index': 'odd'},
                    'backgroundColor': 'rgb(248, 248, 248)'
                }
            ],
            page_size=10,
            filter_action="native",
            sort_action="native",
        )
    ], className='card', style={'padding': '20px', 'boxShadow': '0 4px 8px 0 rgba(0,0,0,0.2)', 'marginBottom': '20px'}),
    
    html.Div([
        html.H3("Post Content Analysis"),
        dcc.Tabs([
            dcc.Tab(label='Hashtags & Mentions', children=[
                html.Div([
                    html.H4("Hashtag & Mention Counts per Post"),
                    dcc.Graph(id='hashtag-mention-chart')
                ], style={'padding': '20px'})
            ]),
            dcc.Tab(label='Caption Preview', children=[
                html.Div([
                    html.H4("Select a Post to View Caption"),
                    dcc.Dropdown(id='post-selector', style={'marginBottom': '20px'}),
                    html.Div(id='caption-display', style={'whiteSpace': 'pre-wrap', 'border': '1px solid #ddd', 'padding': '15px', 'borderRadius': '5px', 'minHeight': '200px'})
                ], style={'padding': '20px'})
            ])
        ])
    ], className='card', style={'padding': '20px', 'boxShadow': '0 4px 8px 0 rgba(0,0,0,0.2)'})
])

# Callbacks
@app.callback(
    [Output('engagement-chart', 'figure'),
     Output('post-types-pie', 'figure'),
     Output('timeline-chart', 'figure'),
     Output('posts-table', 'data'),
     Output('posts-table', 'columns'),
     Output('hashtag-mention-chart', 'figure'),
     Output('post-selector', 'options'),
     Output('last-updated', 'children')],
    [Input('refresh-button', 'n_clicks')]
)
def update_dashboard(n_clicks):
    # Load data
    data = load_data()
    
    # If no data, return empty figures
    if not data:
        empty_fig = go.Figure()
        empty_fig.update_layout(
            title="No data available",
            xaxis={"visible": False},
            yaxis={"visible": False},
            annotations=[{
                "text": "No data found. Please make sure parsed_instagram_posts.json exists.",
                "xref": "paper",
                "yref": "paper",
                "showarrow": False,
                "font": {"size": 20}
            }]
        )
        return (empty_fig, empty_fig, empty_fig, [], [], empty_fig, [], 
                f"Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Create DataFrames
    posts_df = create_dataframes(data)
    
    # Engagement Chart
    engagement_fig = px.bar(posts_df, x='id', y=['likes', 'comments'], 
                           title='Likes and Comments per Post',
                           labels={'value': 'Count', 'variable': 'Metric'},
                           barmode='group')
    
    # Post Types Pie Chart
    type_counts = posts_df['type'].value_counts().reset_index()
    type_counts.columns = ['type', 'count']
    types_fig = px.pie(type_counts, values='count', names='type', 
                      title='Distribution of Post Types')
    
    # Timeline Chart
    if 'date' in posts_df.columns:
        timeline_df = posts_df.groupby('date').agg({'likes': 'sum', 'comments': 'sum'}).reset_index()
        timeline_fig = px.line(timeline_df, x='date', y=['likes', 'comments'],
                              title='Engagement Over Time',
                              labels={'value': 'Count', 'variable': 'Metric'})
    else:
        timeline_fig = go.Figure()
        timeline_fig.update_layout(title="Timeline data not available")
    
    # Table data
    table_df = posts_df[['id', 'type', 'timestamp', 'likes', 'comments', 'hashtag_count', 'mention_count']].copy()
    if 'timestamp' in table_df.columns:
        table_df['timestamp'] = table_df['timestamp'].dt.strftime('%Y-%m-%d %H:%M:%S')
    
    table_data = table_df.to_dict('records')
    table_columns = [{"name": col.capitalize(), "id": col} for col in table_df.columns]
    
    # Hashtag & Mention Chart
    hashtag_mention_fig = px.scatter(posts_df, x='hashtag_count', y='mention_count', 
                                    size='likes', color='type',
                                    hover_data=['id', 'likes', 'comments'],
                                    title='Hashtags vs Mentions (size = likes)')
    
    # Post selector options
    post_options = [{'label': f"Post {row['id']} ({row['type']})", 'value': i} 
                   for i, row in posts_df.iterrows()]
    
    return (engagement_fig, types_fig, timeline_fig, table_data, table_columns, 
            hashtag_mention_fig, post_options, 
            f"Last updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

@app.callback(
    Output('caption-display', 'children'),
    [Input('post-selector', 'value')]
)
def display_caption(selected_index):
    if selected_index is None:
        return "Select a post to view its caption"
    
    data = load_data()
    if not data or selected_index >= len(data):
        return "Post data not available"
    
    post = data[selected_index]
    caption = post.get('caption', 'No caption available')
    
    return caption

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
